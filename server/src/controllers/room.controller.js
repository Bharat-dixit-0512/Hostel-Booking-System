import {
  ACTIVE_BOOKING_STATUSES,
  MAX_HOSTEL_FLOORS,
  MAX_ROOM_CAPACITY,
} from "../constants.js";
import {
  getBookingModel,
  getHostelModel,
  getHostelStudentModel,
  getRoomModel,
  startHostelSession,
} from "../db/index.js";
import { REALTIME_EVENTS } from "../socket/events.js";
import { emitRealtimeEvent } from "../socket/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  applyRoomImportPreview,
  processRoomImportPreview,
} from "../utils/roomImport.utils.js";
import { releaseExpiredPendingBookings } from "../utils/booking.utils.js";

const parseHostelId = (hostelId) => {
  const parsedHostelId = Number(hostelId);

  if (!Number.isInteger(parsedHostelId) || parsedHostelId < 1) {
    throw new ApiError(400, "hostel_id must be a positive integer");
  }

  return parsedHostelId;
};

const parseCapacity = (capacity) => {
  const parsedCapacity = Number(capacity);

  if (
    !Number.isInteger(parsedCapacity) ||
    parsedCapacity < 1 ||
    parsedCapacity > MAX_ROOM_CAPACITY
  ) {
    throw new ApiError(
      400,
      `capacity must be a positive integer up to ${MAX_ROOM_CAPACITY}`,
    );
  }

  return parsedCapacity;
};

const parseAcType = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new ApiError(400, "ac_type must be true or false");
};

const parseFloor = (floor) => {
  const parsedFloor = Number(floor);

  if (
    !Number.isInteger(parsedFloor) ||
    parsedFloor < 0 ||
    parsedFloor >= MAX_HOSTEL_FLOORS
  ) {
    throw new ApiError(
      400,
      `floor must be an integer between 0 and ${MAX_HOSTEL_FLOORS - 1}`,
    );
  }

  return parsedFloor;
};

const validateRoomFloorAgainstHostel = ({ floor, hostel }) => {
  const hostelFloors = Number(hostel?.floors ?? 1);

  if (floor >= hostelFloors) {
    throw new ApiError(
      400,
      `floor must be between 0 and ${hostelFloors - 1} for this hostel`,
    );
  }
};

const ensureHostelExists = async (hostelId) => {
  const Hostel = getHostelModel();
  const hostel = await Hostel.findOne({
    hostel_id: hostelId,
  });

  if (!hostel) {
    throw new ApiError(404, "Hostel not found");
  }

  return hostel;
};

const getRoomDeletionBlocker = async ({ hostelId, room, session }) => {
  const Booking = getBookingModel();
  const HostelStudent = getHostelStudentModel();

  if (room.available_beds < room.capacity) {
    return "Room cannot be deleted because it has at least one booked bed";
  }

  const activeBooking = await Booking.findOne({
    hostel_id: hostelId,
    room_number: room.room_number,
    status: {
      $in: ACTIVE_BOOKING_STATUSES,
    },
  }).session(session);

  if (activeBooking) {
    return "Room cannot be deleted because it has an active booking";
  }

  const allocatedStudent = await HostelStudent.findOne({
    hostel_id: hostelId,
    room_number: room.room_number,
    room_allocated: true,
  }).session(session);

  if (allocatedStudent) {
    return "Room cannot be deleted because it is allocated to a student";
  }

  return null;
};

const getRoomAcTypeChangeBlocker = async ({ hostelId, roomNumber, room }) => {
  const Booking = getBookingModel();
  const HostelStudent = getHostelStudentModel();
  const occupiedBeds = room.capacity - room.available_beds;

  const [pendingCount, confirmedCount, allocatedCount] = await Promise.all([
    Booking.countDocuments({
      hostel_id: hostelId,
      room_number: roomNumber,
      status: "PENDING",
    }),
    Booking.countDocuments({
      hostel_id: hostelId,
      room_number: roomNumber,
      status: "CONFIRMED",
    }),
    HostelStudent.countDocuments({
      hostel_id: hostelId,
      room_number: roomNumber,
      room_allocated: true,
    }),
  ]);

  if (
    occupiedBeds > 0 ||
    pendingCount > 0 ||
    confirmedCount > 0 ||
    allocatedCount > 0
  ) {
    return (
      `AC type cannot be changed for room ${roomNumber} because students are already associated with this room. ` +
      `Occupied beds: ${occupiedBeds}, pending bookings: ${pendingCount}, ` +
      `confirmed bookings: ${confirmedCount}, allocated students: ${allocatedCount}.`
    );
  }

  return null;
};

const getUploadedExcelBuffer = (req) => {
  if (!req.file?.buffer) {
    throw new ApiError(400, "Excel file is required");
  }

  return req.file.buffer;
};

const confirmRoomImportFile = async ({
  fileBuffer,
  hostelId,
  hostelFloors,
}) => {
  const preview = await processRoomImportPreview(
    fileBuffer,
    hostelId,
    hostelFloors,
  );

  if (preview.status === "error") {
    return {
      preview,
      summary: null,
    };
  }

  const summary = await applyRoomImportPreview(hostelId, preview, hostelFloors);

  return {
    preview,
    summary,
  };
};

export const getRoomsByHostel = asyncHandler(async (req, res) => {
  const hostelId = parseHostelId(req.params.hostelId);
  await ensureHostelExists(hostelId);

  const Room = getRoomModel();
  const rooms = await Room.find({
    hostel_id: hostelId,
  }).sort({ room_number: 1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        rooms,
      },
      "Rooms fetched successfully",
    ),
  );
});

export const createRoom = asyncHandler(async (req, res) => {
  const hostelId = parseHostelId(req.params.hostelId);
  const hostel = await ensureHostelExists(hostelId);

  const roomNumber = String(req.body.room_number ?? "").trim();
  const capacity = parseCapacity(req.body.capacity);
  const acType = parseAcType(req.body.ac_type);
  const floor = parseFloor(req.body.floor ?? 0);
  const Room = getRoomModel();

  validateRoomFloorAgainstHostel({
    floor,
    hostel,
  });

  if (!roomNumber) {
    throw new ApiError(400, "room_number is required");
  }

  const room = await Room.create({
    hostel_id: hostelId,
    floor,
    room_number: roomNumber,
    capacity,
    available_beds: capacity,
    ac_type: acType,
  });

  emitRealtimeEvent(REALTIME_EVENTS.INVENTORY_CHANGED, {
    action: "room_created",
    hostel_id: hostelId,
    room_number: room.room_number,
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        room,
      },
      "Room created successfully",
    ),
  );
});

export const updateRoom = asyncHandler(async (req, res) => {
  const hostelId = parseHostelId(req.params.hostelId);
  const roomNumber = String(req.params.roomNumber ?? "").trim();
  const hostel = await ensureHostelExists(hostelId);
  const Room = getRoomModel();

  if (!roomNumber) {
    throw new ApiError(400, "room_number is required");
  }

  const room = await Room.findOne({
    hostel_id: hostelId,
    room_number: roomNumber,
  });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  await releaseExpiredPendingBookings();

  if (req.body.capacity !== undefined) {
    const newCapacity = parseCapacity(req.body.capacity);
    const occupiedBeds = room.capacity - room.available_beds;

    if (newCapacity < occupiedBeds) {
      throw new ApiError(
        400,
        `capacity cannot be lower than occupied beds (${occupiedBeds})`,
      );
    }

    room.capacity = newCapacity;
    room.available_beds = newCapacity - occupiedBeds;
  }

  if (req.body.ac_type !== undefined) {
    const nextAcType = parseAcType(req.body.ac_type);

    if (nextAcType !== room.ac_type) {
      const acTypeChangeBlocker = await getRoomAcTypeChangeBlocker({
        hostelId,
        roomNumber,
        room,
      });

      if (acTypeChangeBlocker) {
        throw new ApiError(409, acTypeChangeBlocker, [
          "Pending and confirmed bookings are both considered for AC type changes.",
        ]);
      }
    }

    room.ac_type = nextAcType;
  }

  if (req.body.floor !== undefined) {
    const nextFloor = parseFloor(req.body.floor);

    validateRoomFloorAgainstHostel({
      floor: nextFloor,
      hostel,
    });

    room.floor = nextFloor;
  }

  await room.save();

  emitRealtimeEvent(REALTIME_EVENTS.INVENTORY_CHANGED, {
    action: "room_updated",
    hostel_id: hostelId,
    room_number: room.room_number,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        room,
      },
      "Room updated successfully",
    ),
  );
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const hostelId = parseHostelId(req.params.hostelId);
  const roomNumber = String(req.params.roomNumber ?? "").trim();
  const Room = getRoomModel();
  const session = await startHostelSession();

  if (!roomNumber) {
    throw new ApiError(400, "room_number is required");
  }

  try {
    session.startTransaction();
    await releaseExpiredPendingBookings(session);

    const room = await Room.findOne({
      hostel_id: hostelId,
      room_number: roomNumber,
    }).session(session);

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    const deletionBlocker = await getRoomDeletionBlocker({
      hostelId,
      room,
      session,
    });

    if (deletionBlocker) {
      throw new ApiError(409, deletionBlocker);
    }

    await room.deleteOne({ session });
    await session.commitTransaction();

    emitRealtimeEvent(REALTIME_EVENTS.INVENTORY_CHANGED, {
      action: "room_deleted",
      hostel_id: hostelId,
      room_number: roomNumber,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          hostel_id: hostelId,
          room_number: roomNumber,
        },
        "Room deleted successfully",
      ),
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

export const previewRoomImport = asyncHandler(async (req, res) => {
  const hostelId = parseHostelId(req.params.hostelId);
  const hostel = await ensureHostelExists(hostelId);
  const preview = await processRoomImportPreview(
    getUploadedExcelBuffer(req),
    hostelId,
    hostel.floors,
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        preview,
      },
      preview.status === "error"
        ? "Room import preview contains errors"
        : "Room import preview generated successfully",
    ),
  );
});

export const confirmRoomImport = asyncHandler(async (req, res) => {
  const hostelId = parseHostelId(req.params.hostelId);
  const hostel = await ensureHostelExists(hostelId);
  const result = await confirmRoomImportFile({
    fileBuffer: getUploadedExcelBuffer(req),
    hostelId,
    hostelFloors: hostel.floors,
  });

  if (result.preview.status === "error") {
    return res.status(400).json(
      new ApiResponse(
        400,
        {
          preview: result.preview,
        },
        "Room import validation failed",
      ),
    );
  }

  emitRealtimeEvent(REALTIME_EVENTS.INVENTORY_CHANGED, {
    action: "room_import_confirmed",
    hostel_id: hostelId,
    summary: result.summary,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Room import confirmed successfully"));
});
