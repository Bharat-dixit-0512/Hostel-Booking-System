import {
    ACTIVE_BOOKING_STATUSES,
    BOOKING_WINDOW_KEY,
    GENDERS,
    RESIDENCE_TYPES,
    STUDENT_YEARS,
} from "../constants.js";
import {
    getAuthAdminModel,
    getAuthStudentModel,
    getBookingModel,
    getBookingWindowModel,
    getHostelAllowedYearModel,
    getHostelModel,
    getHostelStudentModel,
    getRoomModel,
    startHostelSession,
} from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    createOfflineBooking,
    getBookingWindow,
    releaseExpiredPendingBookings,
} from "../utils/booking.utils.js";
import { getNextHostelId } from "../utils/counter.utils.js";
import { verifyPassword } from "../utils/password.js";

const MAX_HOSTEL_CREATE_ATTEMPTS = 5;

const parseHostelId = (hostelId) => {
    const parsedHostelId = Number(hostelId);

    if (!Number.isInteger(parsedHostelId) || parsedHostelId < 1) {
        throw new ApiError(400, "hostel_id must be a positive integer");
    }

    return parsedHostelId;
};

const normalizeAllowedYears = (allowedYears) => {
    if (!Array.isArray(allowedYears) || allowedYears.length === 0) {
        throw new ApiError(400, "allowed_years must be a non-empty array");
    }

    const normalizedYears = [...new Set(allowedYears.map((year) => String(year).trim()))];

    if (normalizedYears.some((year) => !STUDENT_YEARS.includes(year))) {
        throw new ApiError(400, "allowed_years contains invalid year values");
    }

    return normalizedYears;
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

const getHostelDeletionBlocker = async (hostelId, session) => {
    const Room = getRoomModel();
    const Booking = getBookingModel();
    const HostelStudent = getHostelStudentModel();

    const occupiedRoom = await Room.findOne({
        hostel_id: hostelId,
        $expr: {
            $lt: ["$available_beds", "$capacity"],
        },
    }).session(session);

    if (occupiedRoom) {
        return `Hostel cannot be deleted because room ${occupiedRoom.room_number} has at least one booked bed`;
    }

    const activeBooking = await Booking.findOne({
        hostel_id: hostelId,
        status: {
            $in: ACTIVE_BOOKING_STATUSES,
        },
    })
        .select("room_number -_id")
        .session(session);

    if (activeBooking) {
        return `Hostel cannot be deleted because room ${activeBooking.room_number} has an active booking`;
    }

    const allocatedStudent = await HostelStudent.findOne({
        hostel_id: hostelId,
        room_allocated: true,
    })
        .select("room_number -_id")
        .session(session);

    if (allocatedStudent) {
        return `Hostel cannot be deleted because room ${allocatedStudent.room_number} is allocated`;
    }

    return null;
};

const getDuplicateKeyFields = (error) => {
    const keyPattern =
        error?.keyPattern ||
        error?.errorResponse?.keyPattern ||
        error?.keyValue ||
        error?.errorResponse?.keyValue;

    if (keyPattern && Object.keys(keyPattern).length > 0) {
        return Object.keys(keyPattern);
    }

    const indexName = error?.message?.match(/index:\s+([^\s]+)\s+dup key/i)?.[1];

    if (!indexName) {
        return [];
    }

    return [indexName.replace(/_1$/, "")];
};

export const listHostels = asyncHandler(async (_req, res) => {
    const Hostel = getHostelModel();
    const HostelAllowedYear = getHostelAllowedYearModel();
    const Room = getRoomModel();
    const bookingWindow = await getBookingWindow();

    const [hostels, allowedYears, roomSummaries] = await Promise.all([
        Hostel.find().sort({ hostel_name: 1 }),
        HostelAllowedYear.find().sort({ hostel_id: 1, year: 1 }),
        Room.aggregate([
            {
                $group: {
                    _id: "$hostel_id",
                    total_rooms: { $sum: 1 },
                    total_capacity: { $sum: "$capacity" },
                    available_beds: { $sum: "$available_beds" },
                },
            },
        ]),
    ]);

    const allowedYearMap = new Map();
    for (const mapping of allowedYears) {
        const currentYears = allowedYearMap.get(mapping.hostel_id) || [];
        currentYears.push(mapping.year);
        allowedYearMap.set(mapping.hostel_id, currentYears);
    }

    const roomSummaryMap = new Map(roomSummaries.map((summary) => [summary._id, summary]));
    const responseHostels = hostels.map((hostel) => {
        const summary = roomSummaryMap.get(hostel.hostel_id) || {
            total_rooms: 0,
            total_capacity: 0,
            available_beds: 0,
        };

        return {
            hostel_id: hostel.hostel_id,
            hostel_name: hostel.hostel_name,
            gender: hostel.gender,
            allowed_years: allowedYearMap.get(hostel.hostel_id) || [],
            total_rooms: summary.total_rooms,
            total_capacity: summary.total_capacity,
            available_beds: summary.available_beds,
            booking_window_open: bookingWindow.is_open,
        };
    });

    res.status(200).json(
        new ApiResponse(
            200,
            {
                booking_window_open: bookingWindow.is_open,
                hostels: responseHostels,
            },
            "Hostels fetched successfully"
        )
    );
});

export const listBookings = asyncHandler(async (_req, res) => {
    await releaseExpiredPendingBookings();

    const Booking = getBookingModel();
    const Hostel = getHostelModel();
    const [bookings, hostels] = await Promise.all([
        Booking.find().sort({ created_at: -1 }).lean(),
        Hostel.find().select("hostel_id hostel_name gender -_id").lean(),
    ]);
    const hostelMap = new Map(hostels.map((hostel) => [hostel.hostel_id, hostel]));
    const responseBookings = bookings.map((booking) => {
        const hostel = hostelMap.get(booking.hostel_id);

        return {
            ...booking,
            hostel_name: hostel?.hostel_name || null,
            hostel_gender: hostel?.gender || null,
        };
    });

    res.status(200).json(
        new ApiResponse(
            200,
            {
                count: responseBookings.length,
                bookings: responseBookings,
            },
            "Bookings fetched successfully"
        )
    );
});

export const listEligibleStudents = asyncHandler(async (_req, res) => {
    const AuthStudent = getAuthStudentModel();
    const students = await AuthStudent.find({
        residence: RESIDENCE_TYPES.HOSTLER,
    })
        .select("name roll_number year gender -_id")
        .sort({ roll_number: 1 })
        .lean();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                count: students.length,
                students,
            },
            "Eligible students fetched successfully"
        )
    );
});

export const createHostel = asyncHandler(async (req, res) => {
    const { hostel_name, gender, allowed_years = [] } = req.body;

    if (!hostel_name?.trim()) {
        throw new ApiError(400, "hostel_name is required");
    }

    if (!GENDERS.includes(gender)) {
        throw new ApiError(400, "gender must be male or female");
    }

    const Hostel = getHostelModel();
    const HostelAllowedYear = getHostelAllowedYearModel();
    const normalizedAllowedYears = normalizeAllowedYears(allowed_years);
    let hostel;
    const normalizedHostelName = hostel_name.trim();

    for (let attempt = 1; attempt <= MAX_HOSTEL_CREATE_ATTEMPTS; attempt += 1) {
        const session = await startHostelSession();

        try {
            session.startTransaction();

            const hostelId = await getNextHostelId(session);
            hostel = new Hostel({
                hostel_id: hostelId,
                hostel_name: normalizedHostelName,
                gender,
            });

            await hostel.save({ session });
            await HostelAllowedYear.insertMany(
                normalizedAllowedYears.map((year) => ({
                    hostel_id: hostelId,
                    year,
                })),
                { session }
            );

            await session.commitTransaction();
            break;
        } catch (error) {
            await session.abortTransaction();

            const duplicateFields = getDuplicateKeyFields(error);
            const shouldRetryHostelId =
                error?.code === 11000 &&
                duplicateFields.includes("hostel_id") &&
                attempt < MAX_HOSTEL_CREATE_ATTEMPTS;

            if (!shouldRetryHostelId) {
                throw error;
            }
        } finally {
            await session.endSession();
        }
    }

    res.status(201).json(
        new ApiResponse(
            201,
            {
                hostel: {
                    ...hostel.toObject(),
                    allowed_years: normalizedAllowedYears,
                },
            },
            "Hostel created successfully"
        )
    );
});

export const updateHostel = asyncHandler(async (req, res) => {
    const hostelId = parseHostelId(req.params.hostelId);
    const Hostel = getHostelModel();
    const hostel = await Hostel.findOne({
        hostel_id: hostelId,
    });

    if (!hostel) {
        throw new ApiError(404, "Hostel not found");
    }

    if (req.body.hostel_name !== undefined) {
        if (!req.body.hostel_name?.trim()) {
            throw new ApiError(400, "hostel_name cannot be empty");
        }

        hostel.hostel_name = req.body.hostel_name.trim();
    }

    if (req.body.gender !== undefined) {
        if (!GENDERS.includes(req.body.gender)) {
            throw new ApiError(400, "gender must be male or female");
        }

        hostel.gender = req.body.gender;
    }

    await hostel.save();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                hostel,
            },
            "Hostel updated successfully"
        )
    );
});

export const deleteHostel = asyncHandler(async (req, res) => {
    const hostelId = parseHostelId(req.params.hostelId);
    const Hostel = getHostelModel();
    const HostelAllowedYear = getHostelAllowedYearModel();
    const Room = getRoomModel();
    const session = await startHostelSession();

    try {
        session.startTransaction();
        await releaseExpiredPendingBookings(session);

        const hostel = await Hostel.findOne({
            hostel_id: hostelId,
        }).session(session);

        if (!hostel) {
            throw new ApiError(404, "Hostel not found");
        }

        const deletionBlocker = await getHostelDeletionBlocker(hostelId, session);

        if (deletionBlocker) {
            throw new ApiError(409, deletionBlocker);
        }

        const roomDeleteResult = await Room.deleteMany({
            hostel_id: hostelId,
        }).session(session);
        const allowedYearDeleteResult = await HostelAllowedYear.deleteMany({
            hostel_id: hostelId,
        }).session(session);

        await hostel.deleteOne({ session });
        await session.commitTransaction();

        res.status(200).json(
            new ApiResponse(
                200,
                {
                    hostel_id: hostelId,
                    hostel_name: hostel.hostel_name,
                    deleted_rooms: roomDeleteResult.deletedCount ?? 0,
                    deleted_allowed_years: allowedYearDeleteResult.deletedCount ?? 0,
                },
                "Hostel deleted successfully"
            )
        );
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
});

export const replaceAllowedYears = asyncHandler(async (req, res) => {
    const hostelId = parseHostelId(req.params.hostelId);
    await ensureHostelExists(hostelId);

    const normalizedAllowedYears = normalizeAllowedYears(req.body.allowed_years);
    const HostelAllowedYear = getHostelAllowedYearModel();

    await HostelAllowedYear.deleteMany({
        hostel_id: hostelId,
    });

    await HostelAllowedYear.insertMany(
        normalizedAllowedYears.map((year) => ({
            hostel_id: hostelId,
            year,
        }))
    );

    res.status(200).json(
        new ApiResponse(
            200,
            {
                hostel_id: hostelId,
                allowed_years: normalizedAllowedYears,
            },
            "Allowed years updated successfully"
        )
    );
});

export const getBookingWindowStatus = asyncHandler(async (_req, res) => {
    const bookingWindow = await getBookingWindow();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                booking_window_open: bookingWindow.is_open,
                updated_at: bookingWindow.updated_at,
            },
            "Booking window fetched successfully"
        )
    );
});

export const updateBookingWindow = asyncHandler(async (req, res) => {
    if (typeof req.body.is_open !== "boolean") {
        throw new ApiError(400, "is_open must be a boolean");
    }

    const BookingWindow = getBookingWindowModel();
    const bookingWindow = await BookingWindow.findOneAndUpdate(
        { key: BOOKING_WINDOW_KEY },
        {
            $set: {
                is_open: req.body.is_open,
                updated_by_type: "admin",
                updated_by_id: String(req.user.employee_id),
            },
        },
        {
            upsert: true,
            new: true,
        }
    );

    res.status(200).json(
        new ApiResponse(
            200,
            {
                booking_window_open: bookingWindow.is_open,
                updated_at: bookingWindow.updated_at,
            },
            "Booking window updated successfully"
        )
    );
});

export const resetSessionData = asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password?.trim()) {
        throw new ApiError(400, "password is required");
    }

    const AuthAdmin = getAuthAdminModel();
    const admin = await AuthAdmin.findOne({
        employee_id: req.user.employee_id,
    }).select("+password");

    if (!admin || !(await verifyPassword(password.trim(), admin.password))) {
        throw new ApiError(401, "Password confirmation failed");
    }

    const Booking = getBookingModel();
    const HostelStudent = getHostelStudentModel();
    const Room = getRoomModel();
    const session = await startHostelSession();

    try {
        session.startTransaction();

        await Booking.deleteMany({}, { session });
        await HostelStudent.deleteMany({}, { session });
        await Room.updateMany(
            {},
            [
                {
                    $set: {
                        available_beds: "$capacity",
                    },
                },
            ],
            { session, updatePipeline: true }
        );

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }

    res.status(200).json(
        new ApiResponse(200, null, "Hostel session data reset successfully")
    );
});

export const createOfflineBookingController = asyncHandler(async (req, res) => {
    await releaseExpiredPendingBookings();

    const { roll_number, hostel_id, room_number } = req.body;

    if (
        !Number.isInteger(Number(roll_number)) ||
        !Number.isInteger(Number(hostel_id)) ||
        !String(room_number ?? "").trim()
    ) {
        throw new ApiError(400, "roll_number, hostel_id, and room_number are required");
    }

    const AuthStudent = getAuthStudentModel();
    const authStudent = await AuthStudent.findOne({
        roll_number: Number(roll_number),
    });

    if (!authStudent) {
        throw new ApiError(404, "Student not found in AuthDB");
    }

    const booking = await createOfflineBooking({
        authStudent,
        hostelId: Number(hostel_id),
        roomNumber: String(room_number).trim(),
        adminEmployeeId: req.user.employee_id,
    });

    res.status(201).json(
        new ApiResponse(
            201,
            {
                booking,
            },
            "Offline booking created successfully"
        )
    );
});
