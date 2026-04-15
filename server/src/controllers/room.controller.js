import { ACTIVE_BOOKING_STATUSES, MAX_ROOM_CAPACITY } from "../constants.js";
import {
    getBookingModel,
    getHostelModel,
    getHostelStudentModel,
    getRoomModel,
    startHostelSession,
} from "../db/index.js";
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
            `capacity must be a positive integer up to ${MAX_ROOM_CAPACITY}`
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

const getUploadedExcelBuffer = (req) => {
    if (!req.file?.buffer) {
        throw new ApiError(400, "Excel file is required");
    }

    return req.file.buffer;
};

const confirmRoomImportFile = async ({ fileBuffer, hostelId }) => {
    const preview = await processRoomImportPreview(fileBuffer, hostelId);

    if (preview.status === "error") {
        return {
            preview,
            summary: null,
        };
    }

    const summary = await applyRoomImportPreview(hostelId, preview);

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
            "Rooms fetched successfully"
        )
    );
});

export const createRoom = asyncHandler(async (req, res) => {
    const hostelId = parseHostelId(req.params.hostelId);
    await ensureHostelExists(hostelId);

    const roomNumber = String(req.body.room_number ?? "").trim();
    const capacity = parseCapacity(req.body.capacity);
    const acType = parseAcType(req.body.ac_type);
    const Room = getRoomModel();

    if (!roomNumber) {
        throw new ApiError(400, "room_number is required");
    }

    const room = await Room.create({
        hostel_id: hostelId,
        room_number: roomNumber,
        capacity,
        available_beds: capacity,
        ac_type: acType,
    });

    res.status(201).json(
        new ApiResponse(
            201,
            {
                room,
            },
            "Room created successfully"
        )
    );
});

export const updateRoom = asyncHandler(async (req, res) => {
    const hostelId = parseHostelId(req.params.hostelId);
    const roomNumber = String(req.params.roomNumber ?? "").trim();
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

    if (req.body.capacity !== undefined) {
        const newCapacity = parseCapacity(req.body.capacity);
        const occupiedBeds = room.capacity - room.available_beds;

        if (newCapacity < occupiedBeds) {
            throw new ApiError(
                400,
                `capacity cannot be lower than occupied beds (${occupiedBeds})`
            );
        }

        room.capacity = newCapacity;
        room.available_beds = newCapacity - occupiedBeds;
    }

    if (req.body.ac_type !== undefined) {
        room.ac_type = parseAcType(req.body.ac_type);
    }

    await room.save();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                room,
            },
            "Room updated successfully"
        )
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

        res.status(200).json(
            new ApiResponse(
                200,
                {
                    hostel_id: hostelId,
                    room_number: roomNumber,
                },
                "Room deleted successfully"
            )
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
    await ensureHostelExists(hostelId);
    const preview = await processRoomImportPreview(getUploadedExcelBuffer(req), hostelId);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                preview,
            },
            preview.status === "error"
                ? "Room import preview contains errors"
                : "Room import preview generated successfully"
        )
    );
});

export const confirmRoomImport = asyncHandler(async (req, res) => {
    const hostelId = parseHostelId(req.params.hostelId);
    await ensureHostelExists(hostelId);
    const result = await confirmRoomImportFile({
        fileBuffer: getUploadedExcelBuffer(req),
        hostelId,
    });

    if (result.preview.status === "error") {
        return res.status(400).json(
            new ApiResponse(
                400,
                {
                    preview: result.preview,
                },
                "Room import validation failed"
            )
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Room import confirmed successfully"
        )
    );
});
