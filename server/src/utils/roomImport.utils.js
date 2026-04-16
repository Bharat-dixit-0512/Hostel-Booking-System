import { getRoomModel, startHostelSession } from "../db/index.js";
import ApiError from "./ApiError.js";
import { parseRoomImportWorkbookWithWarnings } from "./excel.utils.js";

const getDuplicateRoomNumbers = (roomRows) => {
  const seenRoomNumbers = new Set();
  const duplicateRoomNumbers = new Set();

  for (const roomRow of roomRows) {
    const roomNumber = roomRow.room_number;

    if (seenRoomNumbers.has(roomNumber)) {
      duplicateRoomNumbers.add(roomNumber);
    }

    seenRoomNumbers.add(roomNumber);
  }

  return [...duplicateRoomNumbers];
};

export const processRoomImportPreview = async (
  fileBuffer,
  hostelId,
  hostelFloors = 1,
) => {
  const Room = getRoomModel();
  const { roomRows, warnings, totalRows, emptyRowsSkipped } =
    parseRoomImportWorkbookWithWarnings(fileBuffer);
  const duplicateRoomNumbers = getDuplicateRoomNumbers(roomRows);

  if (duplicateRoomNumbers.length > 0) {
    return {
      status: "error",
      total_rows: totalRows,
      valid_rows: roomRows.length,
      invalid_rows_skipped: warnings.length,
      empty_rows_skipped: emptyRowsSkipped,
      new_rooms: [],
      updated_rooms: [],
      unchanged_rooms: [],
      warnings,
      errors: duplicateRoomNumbers.map(
        (roomNumber) => `Room ${roomNumber}: duplicate row found in Excel file`,
      ),
    };
  }

  const roomNumbers = roomRows.map((roomRow) => roomRow.room_number);
  const existingRooms = await Room.find({
    hostel_id: hostelId,
    room_number: {
      $in: roomNumbers,
    },
  }).lean();
  const existingRoomByNumber = new Map(
    existingRooms.map((room) => [room.room_number, room]),
  );
  const preview = {
    status: "ready",
    total_rows: totalRows,
    valid_rows: roomRows.length,
    invalid_rows_skipped: warnings.length,
    empty_rows_skipped: emptyRowsSkipped,
    new_rooms: [],
    updated_rooms: [],
    unchanged_rooms: [],
    warnings,
    errors: [],
  };

  for (const roomRow of roomRows) {
    const existingRoom = existingRoomByNumber.get(roomRow.room_number);

    if (!existingRoom) {
      if (roomRow.floor >= hostelFloors) {
        preview.errors.push(
          `Room ${roomRow.room_number}: floor ${roomRow.floor} exceeds hostel floors (${hostelFloors})`,
        );
        continue;
      }

      preview.new_rooms.push({
        room_number: roomRow.room_number,
        capacity: roomRow.capacity,
        ac_type: roomRow.ac_type,
        floor: roomRow.floor,
      });
      continue;
    }

    const occupiedBeds = existingRoom.capacity - existingRoom.available_beds;

    if (roomRow.capacity < occupiedBeds) {
      preview.errors.push(
        `Room ${roomRow.room_number}: capacity cannot be lower than occupied beds (${occupiedBeds})`,
      );
      continue;
    }

    const isCapacityChanged = existingRoom.capacity !== roomRow.capacity;
    const isAcTypeChanged = existingRoom.ac_type !== roomRow.ac_type;
    const isFloorChanged = (existingRoom.floor ?? 0) !== roomRow.floor;

    if (roomRow.floor >= hostelFloors) {
      preview.errors.push(
        `Room ${roomRow.room_number}: floor ${roomRow.floor} exceeds hostel floors (${hostelFloors})`,
      );
      continue;
    }

    if (!isCapacityChanged && !isAcTypeChanged && !isFloorChanged) {
      preview.unchanged_rooms.push({
        room_number: roomRow.room_number,
        capacity: roomRow.capacity,
        ac_type: roomRow.ac_type,
        floor: roomRow.floor,
      });
      continue;
    }

    preview.updated_rooms.push({
      room_number: roomRow.room_number,
      old_capacity: existingRoom.capacity,
      new_capacity: roomRow.capacity,
      old_ac_type: existingRoom.ac_type,
      new_ac_type: roomRow.ac_type,
      old_floor: existingRoom.floor ?? 0,
      new_floor: roomRow.floor,
      occupied_beds: occupiedBeds,
    });
  }

  if (preview.errors.length > 0) {
    preview.status = "error";
  }

  return preview;
};

export const applyRoomImportPreview = async (
  hostelId,
  preview,
  hostelFloors = 1,
) => {
  if (preview.status === "error") {
    throw new ApiError(400, "Room import validation failed", preview.errors);
  }

  const Room = getRoomModel();
  const session = await startHostelSession();
  const summary = {
    created: 0,
    updated: 0,
    skipped: preview.unchanged_rooms.length,
    warnings: preview.warnings || [],
    invalid_rows_skipped: preview.invalid_rows_skipped || 0,
    empty_rows_skipped: preview.empty_rows_skipped || 0,
    errors: [],
  };

  try {
    session.startTransaction();

    for (const room of preview.new_rooms) {
      if (room.floor >= hostelFloors) {
        throw new ApiError(
          400,
          `Room ${room.room_number}: floor ${room.floor} exceeds hostel floors (${hostelFloors})`,
        );
      }

      await Room.create(
        [
          {
            hostel_id: hostelId,
            floor: room.floor,
            room_number: room.room_number,
            capacity: room.capacity,
            available_beds: room.capacity,
            ac_type: room.ac_type,
          },
        ],
        { session },
      );

      summary.created += 1;
    }

    for (const room of preview.updated_rooms) {
      const existingRoom = await Room.findOne({
        hostel_id: hostelId,
        room_number: room.room_number,
      }).session(session);

      if (!existingRoom) {
        throw new ApiError(409, `Room ${room.room_number}: no longer exists`);
      }

      const occupiedBeds = existingRoom.capacity - existingRoom.available_beds;

      if (room.new_capacity < occupiedBeds) {
        throw new ApiError(
          400,
          `Room ${room.room_number}: capacity cannot be lower than occupied beds (${occupiedBeds})`,
        );
      }

      if (room.new_floor >= hostelFloors) {
        throw new ApiError(
          400,
          `Room ${room.room_number}: floor ${room.new_floor} exceeds hostel floors (${hostelFloors})`,
        );
      }

      existingRoom.capacity = room.new_capacity;
      existingRoom.available_beds = room.new_capacity - occupiedBeds;
      existingRoom.ac_type = room.new_ac_type;
      existingRoom.floor = room.new_floor;

      await existingRoom.save({ session });
      summary.updated += 1;
    }

    await session.commitTransaction();

    return summary;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const confirmRoomImportWorkbook = async (
  fileBuffer,
  hostelId,
  hostelFloors = 1,
) => {
  const preview = await processRoomImportPreview(
    fileBuffer,
    hostelId,
    hostelFloors,
  );
  const summary = await applyRoomImportPreview(hostelId, preview, hostelFloors);

  return {
    preview,
    summary,
  };
};
