import {
    ACTIVE_BOOKING_STATUSES,
    BOOKED_BY_TYPES,
    BOOKING_SOURCES,
    BOOKING_STATUSES,
    BOOKING_WINDOW_KEY,
    HOLD_MINUTES,
    LOGIN_TYPES,
    RESIDENCE_TYPES,
} from "../constants.js";
import {
    getBookingModel,
    getBookingWindowModel,
    getHostelAllowedYearModel,
    getHostelModel,
    getHostelStudentModel,
    getRoomModel,
    startHostelSession,
} from "../db/index.js";
import ApiError from "./ApiError.js";
import {
    getHostelPricingValueMap,
    getPricingCategoryKey,
} from "./hostelPricing.utils.js";

const withSession = (query, session) => (session ? query.session(session) : query);
const sessionOptions = (session, extraOptions = {}) =>
    session ? { ...extraOptions, session } : extraOptions;

const getNow = () => new Date();

export const getBookingWindow = async () => {
    const BookingWindow = getBookingWindowModel();

    return BookingWindow.findOneAndUpdate(
        { key: BOOKING_WINDOW_KEY },
        {
            $setOnInsert: {
                is_open: false,
            },
        },
        {
            upsert: true,
            new: true,
        }
    );
};

export const syncHostelStudentFromAuthStudent = async (authStudent, session = null) => {
    const HostelStudent = getHostelStudentModel();

    const existingStudent = await withSession(
        HostelStudent.findOne({ roll_number: authStudent.roll_number }),
        session
    );

    if (!existingStudent) {
        return HostelStudent.create(
            [
                {
                    roll_number: authStudent.roll_number,
                    year: authStudent.year,
                    gender: authStudent.gender,
                    room_allocated: false,
                    hostel_id: null,
                    room_number: null,
                },
            ],
            sessionOptions(session)
        ).then(([createdStudent]) => createdStudent);
    }

    existingStudent.year = authStudent.year;
    existingStudent.gender = authStudent.gender;
    await existingStudent.save(sessionOptions(session));

    return existingStudent;
};

export const releaseExpiredPendingBookings = async (session = null) => {
    const Booking = getBookingModel();
    const Room = getRoomModel();
    const expiredBookings = await withSession(
        Booking.find({
            status: BOOKING_STATUSES.PENDING,
            expires_at: { $lte: getNow() },
        }).select("_id hostel_id room_number"),
        session
    );

    let releasedCount = 0;

    for (const expiredBooking of expiredBookings) {
        const updatedBooking = await Booking.findOneAndUpdate(
            {
                _id: expiredBooking._id,
                status: BOOKING_STATUSES.PENDING,
            },
            {
                $set: {
                    status: BOOKING_STATUSES.EXPIRED,
                },
            },
            sessionOptions(session, { new: true })
        );

        if (!updatedBooking) {
            continue;
        }

        await Room.findOneAndUpdate(
            {
                hostel_id: expiredBooking.hostel_id,
                room_number: expiredBooking.room_number,
            },
            {
                $inc: {
                    available_beds: 1,
                },
            },
            sessionOptions(session)
        );

        releasedCount += 1;
    }

    return releasedCount;
};

export const getStudentActiveBooking = (rollNumber, session = null) => {
    const Booking = getBookingModel();

    return withSession(
        Booking.findOne({
            roll_number: rollNumber,
            status: {
                $in: ACTIVE_BOOKING_STATUSES,
            },
        }).sort({ created_at: -1 }),
        session
    );
};

export const ensureStudentIsEligibleForHostel = async ({ hostelId, student, session = null }) => {
    const Hostel = getHostelModel();
    const HostelAllowedYear = getHostelAllowedYearModel();
    const hostel = await withSession(
        Hostel.findOne({
            hostel_id: hostelId,
            gender: student.gender,
        }),
        session
    );

    if (!hostel) {
        throw new ApiError(403, "Student is not eligible for this hostel");
    }

    const allowedYear = await withSession(
        HostelAllowedYear.findOne({
            hostel_id: hostelId,
            year: student.year,
        }),
        session
    );

    if (!allowedYear) {
        throw new ApiError(403, "Student is not eligible for this hostel");
    }
};

export const createPendingStudentBooking = async ({
    rollNumber,
    hostelId,
    roomNumber,
}) => {
    const Booking = getBookingModel();
    const HostelStudent = getHostelStudentModel();
    const Room = getRoomModel();
    const session = await startHostelSession();

    try {
        session.startTransaction();
        await releaseExpiredPendingBookings(session);

        const bookingWindow = await getBookingWindow();

        if (!bookingWindow?.is_open) {
            throw new ApiError(409, "Booking window is currently closed");
        }

        const hostelStudent = await withSession(
            HostelStudent.findOne({ roll_number: rollNumber }),
            session
        );

        if (!hostelStudent) {
            throw new ApiError(404, "Student profile not found in hostel database");
        }

        if (hostelStudent.room_allocated) {
            throw new ApiError(409, "Student already has a confirmed room allocation");
        }

        await ensureStudentIsEligibleForHostel({
            hostelId,
            student: hostelStudent,
            session,
        });

        const existingBooking = await getStudentActiveBooking(rollNumber, session);

        if (existingBooking) {
            throw new ApiError(409, "Student already has an active booking");
        }

        const room = await Room.findOneAndUpdate(
            {
                hostel_id: hostelId,
                room_number: roomNumber,
                available_beds: { $gt: 0 },
            },
            {
                $inc: {
                    available_beds: -1,
                },
            },
            sessionOptions(session, { new: true })
        );

        if (!room) {
            throw new ApiError(409, "Room is full or does not exist");
        }

        const pricingMap = await getHostelPricingValueMap(hostelId, session);
        const pricingCategory = getPricingCategoryKey({
            capacity: room.capacity,
            acType: room.ac_type,
        });
        const roomPrice = pricingMap.get(pricingCategory);

        if (roomPrice === undefined) {
            throw new ApiError(409, "Pricing is not configured for the selected room category");
        }

        const [booking] = await Booking.create(
            [
                {
                    roll_number: rollNumber,
                    hostel_id: hostelId,
                    room_number: roomNumber,
                    room_capacity: room.capacity,
                    room_ac_type: room.ac_type,
                    price: roomPrice,
                    status: BOOKING_STATUSES.PENDING,
                    source: BOOKING_SOURCES.ONLINE,
                    booked_by_type: BOOKED_BY_TYPES.STUDENT,
                    booked_by_id: String(rollNumber),
                    expires_at: new Date(Date.now() + HOLD_MINUTES * 60 * 1000),
                },
            ],
            sessionOptions(session)
        );

        await session.commitTransaction();
        return booking;
    } catch (error) {
        await session.abortTransaction();

        if (error?.code === 11000) {
            throw new ApiError(409, "Student already has an active booking");
        }

        throw error;
    } finally {
        await session.endSession();
    }
};

export const confirmBookingPayment = async ({
    bookingId,
    rollNumber,
    paymentReference,
}) => {
    const Booking = getBookingModel();
    const HostelStudent = getHostelStudentModel();
    const session = await startHostelSession();

    try {
        session.startTransaction();
        await releaseExpiredPendingBookings(session);

        const booking = await withSession(
            Booking.findOne({
                _id: bookingId,
                roll_number: rollNumber,
            }),
            session
        );

        if (!booking) {
            throw new ApiError(404, "Booking not found");
        }

        if (booking.status === BOOKING_STATUSES.CONFIRMED) {
            await session.commitTransaction();
            return booking;
        }

        if (booking.status !== BOOKING_STATUSES.PENDING) {
            throw new ApiError(409, `Booking is already ${booking.status.toLowerCase()}`);
        }

        if (booking.expires_at && booking.expires_at <= getNow()) {
            throw new ApiError(409, "Booking has already expired");
        }

        booking.status = BOOKING_STATUSES.CONFIRMED;
        booking.price = booking.price ?? 0;
        booking.room_capacity = booking.room_capacity ?? null;
        booking.room_ac_type = booking.room_ac_type ?? null;
        booking.payment_reference = paymentReference?.trim() || null;
        booking.confirmed_at = getNow();
        booking.expires_at = null;
        await booking.save(sessionOptions(session));

        await HostelStudent.findOneAndUpdate(
            { roll_number: rollNumber },
            {
                $set: {
                    room_allocated: true,
                    hostel_id: booking.hostel_id,
                    room_number: booking.room_number,
                },
            },
            sessionOptions(session)
        );

        await session.commitTransaction();
        return booking;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};

export const cancelStudentBooking = async ({ bookingId, rollNumber }) => {
    const Booking = getBookingModel();
    const Room = getRoomModel();
    const session = await startHostelSession();

    try {
        session.startTransaction();
        await releaseExpiredPendingBookings(session);

        const booking = await withSession(
            Booking.findOne({
                _id: bookingId,
                roll_number: rollNumber,
            }),
            session
        );

        if (!booking) {
            throw new ApiError(404, "Booking not found");
        }

        if (booking.status !== BOOKING_STATUSES.PENDING) {
            throw new ApiError(409, "Only pending bookings can be cancelled");
        }

        booking.status = BOOKING_STATUSES.CANCELLED;
        booking.price = booking.price ?? 0;
        booking.room_capacity = booking.room_capacity ?? null;
        booking.room_ac_type = booking.room_ac_type ?? null;
        booking.cancelled_at = getNow();
        booking.expires_at = null;
        await booking.save(sessionOptions(session));

        await Room.findOneAndUpdate(
            {
                hostel_id: booking.hostel_id,
                room_number: booking.room_number,
            },
            {
                $inc: {
                    available_beds: 1,
                },
            },
            sessionOptions(session)
        );

        await session.commitTransaction();
        return booking;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};

export const createOfflineBooking = async ({
    authStudent,
    hostelId,
    roomNumber,
    adminEmployeeId,
}) => {
    if (authStudent.residence !== RESIDENCE_TYPES.HOSTLER) {
        throw new ApiError(403, "Only hostler students can receive hostel bookings");
    }

    const Booking = getBookingModel();
    const HostelStudent = getHostelStudentModel();
    const Room = getRoomModel();
    const session = await startHostelSession();

    try {
        session.startTransaction();
        await releaseExpiredPendingBookings(session);

        const hostelStudent = await syncHostelStudentFromAuthStudent(authStudent, session);

        if (hostelStudent.room_allocated) {
            throw new ApiError(409, "Student already has a confirmed room allocation");
        }

        await ensureStudentIsEligibleForHostel({
            hostelId,
            student: hostelStudent,
            session,
        });

        const activeBooking = await getStudentActiveBooking(authStudent.roll_number, session);

        if (activeBooking) {
            throw new ApiError(409, "Student already has an active booking");
        }

        const room = await Room.findOneAndUpdate(
            {
                hostel_id: hostelId,
                room_number: roomNumber,
                available_beds: { $gt: 0 },
            },
            {
                $inc: {
                    available_beds: -1,
                },
            },
            sessionOptions(session, { new: true })
        );

        if (!room) {
            throw new ApiError(409, "Room is full or does not exist");
        }

        const pricingMap = await getHostelPricingValueMap(hostelId, session);
        const pricingCategory = getPricingCategoryKey({
            capacity: room.capacity,
            acType: room.ac_type,
        });
        const roomPrice = pricingMap.get(pricingCategory);

        if (roomPrice === undefined) {
            throw new ApiError(409, "Pricing is not configured for the selected room category");
        }

        const [booking] = await Booking.create(
            [
                {
                    roll_number: authStudent.roll_number,
                    hostel_id: hostelId,
                    room_number: roomNumber,
                    room_capacity: room.capacity,
                    room_ac_type: room.ac_type,
                    price: roomPrice,
                    status: BOOKING_STATUSES.CONFIRMED,
                    source: BOOKING_SOURCES.OFFLINE,
                    booked_by_type: BOOKED_BY_TYPES.ADMIN,
                    booked_by_id: String(adminEmployeeId),
                    confirmed_at: getNow(),
                },
            ],
            sessionOptions(session)
        );

        await HostelStudent.findOneAndUpdate(
            { roll_number: authStudent.roll_number },
            {
                $set: {
                    room_allocated: true,
                    hostel_id: hostelId,
                    room_number: roomNumber,
                },
            },
            sessionOptions(session)
        );

        await session.commitTransaction();
        return booking;
    } catch (error) {
        await session.abortTransaction();

        if (error?.code === 11000) {
            throw new ApiError(409, "Student already has an active booking");
        }

        throw error;
    } finally {
        await session.endSession();
    }
};

export const formatStudentJwtPayload = (authStudent) => ({
    login_type: LOGIN_TYPES.STUDENT,
    roll_number: authStudent.roll_number,
    name: authStudent.name,
    email: authStudent.email,
    token_version: authStudent.token_version ?? 0,
});
