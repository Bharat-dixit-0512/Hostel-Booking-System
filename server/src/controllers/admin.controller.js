import {
  ACTIVE_BOOKING_STATUSES,
  BOOKING_WINDOW_KEY,
  GENDERS,
  MAX_HOSTEL_FLOORS,
  MAX_ROOM_CAPACITY,
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
  getHostelRoomPricingModel,
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
import {
  ensureHostelPricingRows,
  getDefaultPricingRows,
  getNormalizedHostelPricing,
} from "../utils/hostelPricing.utils.js";
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

  const normalizedYears = [
    ...new Set(allowedYears.map((year) => String(year).trim())),
  ];

  if (normalizedYears.some((year) => !STUDENT_YEARS.includes(year))) {
    throw new ApiError(400, "allowed_years contains invalid year values");
  }

  return normalizedYears;
};

const parseFloors = (floors) => {
  const parsedFloors = Number(floors);

  if (
    !Number.isInteger(parsedFloors) ||
    parsedFloors < 1 ||
    parsedFloors > MAX_HOSTEL_FLOORS
  ) {
    throw new ApiError(
      400,
      `floors must be a positive integer up to ${MAX_HOSTEL_FLOORS}`,
    );
  }

  return parsedFloors;
};

const parsePrice = (price) => {
  const parsedPrice = Number(price);

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw new ApiError(400, "price must be a non-negative number");
  }

  return Number(parsedPrice.toFixed(2));
};

const normalizePricingPayload = (pricing) => {
  if (!Array.isArray(pricing) || pricing.length === 0) {
    throw new ApiError(400, "pricing must be a non-empty array");
  }

  const normalizedRows = pricing.map((row, index) => {
    const capacity = Number(row?.capacity);
    const acType = row?.ac_type;

    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > MAX_ROOM_CAPACITY
    ) {
      throw new ApiError(
        400,
        `pricing[${index}].capacity must be an integer between 1 and ${MAX_ROOM_CAPACITY}`,
      );
    }

    if (typeof acType !== "boolean") {
      throw new ApiError(400, `pricing[${index}].ac_type must be boolean`);
    }

    return {
      capacity,
      ac_type: acType,
      price: parsePrice(row?.price),
    };
  });

  const duplicateKeySet = new Set();

  normalizedRows.forEach((row) => {
    const key = `${row.capacity}_${row.ac_type}`;

    if (duplicateKeySet.has(key)) {
      throw new ApiError(
        400,
        "pricing payload contains duplicate capacity/ac_type category",
      );
    }

    duplicateKeySet.add(key);
  });

  return normalizedRows;
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

const getHostelOccupancySnapshot = async (hostelId) => {
  const Booking = getBookingModel();
  const HostelStudent = getHostelStudentModel();
  const Room = getRoomModel();

  const [activeBookings, allocatedStudents, occupiedRoomCount] =
    await Promise.all([
      Booking.find({
        hostel_id: hostelId,
        status: {
          $in: ACTIVE_BOOKING_STATUSES,
        },
      })
        .select("roll_number status room_number -_id")
        .lean(),
      HostelStudent.find({
        hostel_id: hostelId,
        room_allocated: true,
      })
        .select("roll_number year gender room_number -_id")
        .lean(),
      Room.countDocuments({
        hostel_id: hostelId,
        $expr: {
          $lt: ["$available_beds", "$capacity"],
        },
      }),
    ]);

  const uniqueActiveRollNumbers = [
    ...new Set(activeBookings.map((booking) => booking.roll_number)),
  ];
  const activeProfiles = uniqueActiveRollNumbers.length
    ? await HostelStudent.find({
        roll_number: {
          $in: uniqueActiveRollNumbers,
        },
      })
        .select("roll_number year gender -_id")
        .lean()
    : [];
  const activeProfileByRoll = new Map(
    activeProfiles.map((profile) => [profile.roll_number, profile]),
  );

  const activeBookingsWithProfile = activeBookings.map((booking) => ({
    ...booking,
    student: activeProfileByRoll.get(booking.roll_number) || null,
  }));

  const pendingBookingCount = activeBookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;
  const confirmedBookingCount = activeBookings.filter(
    (booking) => booking.status === "CONFIRMED",
  ).length;

  return {
    activeBookings,
    activeBookingsWithProfile,
    allocatedStudents,
    occupiedRoomCount,
    pendingBookingCount,
    confirmedBookingCount,
  };
};

export const listHostels = asyncHandler(async (_req, res) => {
  const Hostel = getHostelModel();
  const HostelAllowedYear = getHostelAllowedYearModel();
  const HostelRoomPricing = getHostelRoomPricingModel();
  const Room = getRoomModel();
  const bookingWindow = await getBookingWindow();

  const hostels = await Hostel.find().sort({ hostel_name: 1 });
  await Promise.all(
    hostels.map((hostel) => ensureHostelPricingRows(hostel.hostel_id)),
  );

  const [allowedYears, roomSummaries, pricingRows] = await Promise.all([
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
    HostelRoomPricing.find().sort({ hostel_id: 1, capacity: 1, ac_type: -1 }).lean(),
  ]);

  const allowedYearMap = new Map();
  for (const mapping of allowedYears) {
    const currentYears = allowedYearMap.get(mapping.hostel_id) || [];
    currentYears.push(mapping.year);
    allowedYearMap.set(mapping.hostel_id, currentYears);
  }

  const roomSummaryMap = new Map(
    roomSummaries.map((summary) => [summary._id, summary]),
  );
  const pricingMap = new Map();

  for (const pricing of pricingRows) {
    const currentRows = pricingMap.get(pricing.hostel_id) || [];
    currentRows.push({
      capacity: pricing.capacity,
      ac_type: pricing.ac_type,
      price: pricing.price,
      category: `${pricing.capacity}bed_${pricing.ac_type ? "ac" : "non_ac"}`,
    });
    pricingMap.set(pricing.hostel_id, currentRows);
  }

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
      floors: hostel.floors,
      allowed_years: allowedYearMap.get(hostel.hostel_id) || [],
      pricing: pricingMap.get(hostel.hostel_id) || [],
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
      "Hostels fetched successfully",
    ),
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
  const hostelMap = new Map(
    hostels.map((hostel) => [hostel.hostel_id, hostel]),
  );
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
      "Bookings fetched successfully",
    ),
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
      "Eligible students fetched successfully",
    ),
  );
});

export const createHostel = asyncHandler(async (req, res) => {
  const { hostel_name, gender, floors, allowed_years = [] } = req.body;

  if (!hostel_name?.trim()) {
    throw new ApiError(400, "hostel_name is required");
  }

  if (!GENDERS.includes(gender)) {
    throw new ApiError(400, "gender must be male or female");
  }

  const parsedFloors = parseFloors(floors);

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
        floors: parsedFloors,
      });

      await hostel.save({ session });
      await HostelAllowedYear.insertMany(
        normalizedAllowedYears.map((year) => ({
          hostel_id: hostelId,
          year,
        })),
        { session },
      );
      await getHostelRoomPricingModel().insertMany(
        getDefaultPricingRows(hostelId),
        { session },
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
      "Hostel created successfully",
    ),
  );
});

export const updateHostel = asyncHandler(async (req, res) => {
  const hostelId = parseHostelId(req.params.hostelId);
  const Hostel = getHostelModel();
  const Room = getRoomModel();
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

    if (req.body.gender !== hostel.gender) {
      await releaseExpiredPendingBookings();
      const occupancySnapshot = await getHostelOccupancySnapshot(hostelId);
      const hasBookedOrAllocatedStudents =
        occupancySnapshot.activeBookings.length > 0 ||
        occupancySnapshot.allocatedStudents.length > 0 ||
        occupancySnapshot.occupiedRoomCount > 0;

      if (hasBookedOrAllocatedStudents) {
        const reason =
          `Cannot change hostel gender to ${req.body.gender} because this hostel still has booked/allocated beds. ` +
          `Active bookings: ${occupancySnapshot.activeBookings.length} ` +
          `(pending: ${occupancySnapshot.pendingBookingCount}, confirmed: ${occupancySnapshot.confirmedBookingCount}), ` +
          `allocated students: ${occupancySnapshot.allocatedStudents.length}.`;

        throw new ApiError(409, reason, [
          "Pending and confirmed bookings are both considered while validating gender changes.",
        ]);
      }
    }

    hostel.gender = req.body.gender;
  }

  if (req.body.floors !== undefined) {
    const nextFloors = parseFloors(req.body.floors);

    if (nextFloors < hostel.floors) {
      const highestConfiguredFloor = await Room.findOne({
        hostel_id: hostelId,
      })
        .sort({ floor: -1 })
        .select("floor -_id")
        .lean();

      if ((highestConfiguredFloor?.floor ?? -1) >= nextFloors) {
        throw new ApiError(
          409,
          `Cannot reduce floors to ${nextFloors} because rooms already exist up to floor ${highestConfiguredFloor.floor}.`,
        );
      }
    }

    hostel.floors = nextFloors;
  }

  await hostel.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        hostel,
      },
      "Hostel updated successfully",
    ),
  );
});

export const deleteHostel = asyncHandler(async (req, res) => {
  const hostelId = parseHostelId(req.params.hostelId);
  const Hostel = getHostelModel();
  const HostelAllowedYear = getHostelAllowedYearModel();
  const HostelRoomPricing = getHostelRoomPricingModel();
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
    const pricingDeleteResult = await HostelRoomPricing.deleteMany({
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
          deleted_pricing_rows: pricingDeleteResult.deletedCount ?? 0,
        },
        "Hostel deleted successfully",
      ),
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
  await releaseExpiredPendingBookings();

  const occupancySnapshot = await getHostelOccupancySnapshot(hostelId);
  const allowedYearSet = new Set(normalizedAllowedYears);
  const violatingActiveBookings =
    occupancySnapshot.activeBookingsWithProfile.filter(
      (booking) => booking.student && !allowedYearSet.has(booking.student.year),
    );
  const violatingAllocatedStudents = occupancySnapshot.allocatedStudents.filter(
    (student) => !allowedYearSet.has(student.year),
  );

  const violatingRollNumbers = new Set([
    ...violatingActiveBookings.map((booking) => booking.roll_number),
    ...violatingAllocatedStudents.map((student) => student.roll_number),
  ]);

  if (violatingRollNumbers.size > 0) {
    const violatingYears = [
      ...new Set([
        ...violatingActiveBookings
          .map((booking) => booking.student?.year)
          .filter(Boolean),
        ...violatingAllocatedStudents.map((student) => student.year),
      ]),
    ];
    const pendingViolations = violatingActiveBookings.filter(
      (booking) => booking.status === "PENDING",
    ).length;
    const confirmedViolations = violatingActiveBookings.filter(
      (booking) => booking.status === "CONFIRMED",
    ).length;
    const message =
      "Cannot update allowed years because some students with active/allocated beds would become ineligible. " +
      `Disallowed years in use: ${violatingYears.join(", ") || "unknown"}.`;

    throw new ApiError(409, message, [
      `Affected students: ${violatingRollNumbers.size}`,
      `Pending bookings in disallowed years: ${pendingViolations}`,
      `Confirmed bookings in disallowed years: ${confirmedViolations}`,
      `Allocated students in disallowed years: ${violatingAllocatedStudents.length}`,
      "Pending and confirmed bookings are both considered while validating allowed-year changes.",
    ]);
  }

  const HostelAllowedYear = getHostelAllowedYearModel();

  await HostelAllowedYear.deleteMany({
    hostel_id: hostelId,
  });

  await HostelAllowedYear.insertMany(
    normalizedAllowedYears.map((year) => ({
      hostel_id: hostelId,
      year,
    })),
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        hostel_id: hostelId,
        allowed_years: normalizedAllowedYears,
      },
      "Allowed years updated successfully",
    ),
  );
});

export const getHostelPricing = asyncHandler(async (req, res) => {
  const hostelId = parseHostelId(req.params.hostelId);
  await ensureHostelExists(hostelId);

  const pricing = await getNormalizedHostelPricing(hostelId);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        hostel_id: hostelId,
        pricing,
      },
      "Hostel pricing fetched successfully",
    ),
  );
});

export const updateHostelPricing = asyncHandler(async (req, res) => {
  const hostelId = parseHostelId(req.params.hostelId);
  await ensureHostelExists(hostelId);

  const normalizedRows = normalizePricingPayload(req.body.pricing);
  const HostelRoomPricing = getHostelRoomPricingModel();

  await ensureHostelPricingRows(hostelId);

  await HostelRoomPricing.bulkWrite(
    normalizedRows.map((row) => ({
      updateOne: {
        filter: {
          hostel_id: hostelId,
          capacity: row.capacity,
          ac_type: row.ac_type,
        },
        update: {
          $set: {
            price: row.price,
          },
        },
      },
    })),
  );

  const pricing = await getNormalizedHostelPricing(hostelId);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        hostel_id: hostelId,
        pricing,
      },
      "Hostel pricing updated successfully",
    ),
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
      "Booking window fetched successfully",
    ),
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
    },
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        booking_window_open: bookingWindow.is_open,
        updated_at: bookingWindow.updated_at,
      },
      "Booking window updated successfully",
    ),
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
      { session, updatePipeline: true },
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Hostel session data reset successfully"));
});

export const createOfflineBookingController = asyncHandler(async (req, res) => {
  await releaseExpiredPendingBookings();

  const { roll_number, hostel_id, room_number } = req.body;

  if (
    !Number.isInteger(Number(roll_number)) ||
    !Number.isInteger(Number(hostel_id)) ||
    !String(room_number ?? "").trim()
  ) {
    throw new ApiError(
      400,
      "roll_number, hostel_id, and room_number are required",
    );
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
      "Offline booking created successfully",
    ),
  );
});
