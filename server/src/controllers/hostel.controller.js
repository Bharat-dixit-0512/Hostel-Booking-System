import {
  getHostelAllowedYearModel,
  getHostelModel,
  getRoomModel,
} from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getBookingWindow,
  releaseExpiredPendingBookings,
} from "../utils/booking.utils.js";
import {
  getHostelPricingValueMap,
  getPricingCategoryKey,
} from "../utils/hostelPricing.utils.js";

const parseHostelId = (hostelId) => {
  const parsedHostelId = Number(hostelId);

  if (!Number.isInteger(parsedHostelId) || parsedHostelId < 1) {
    throw new ApiError(400, "hostel_id must be a positive integer");
  }

  return parsedHostelId;
};

export const getEligibleHostels = asyncHandler(async (req, res) => {
  await releaseExpiredPendingBookings();

  const Hostel = getHostelModel();
  const HostelAllowedYear = getHostelAllowedYearModel();
  const Room = getRoomModel();
  const bookingWindow = await getBookingWindow();
  const { hostelStudent } = req.user;

  const allowedYearMappings = await HostelAllowedYear.find({
    year: hostelStudent.year,
  }).select("hostel_id -_id");
  const eligibleHostelIds = allowedYearMappings.map((item) => item.hostel_id);

  if (eligibleHostelIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          booking_window_open: bookingWindow.is_open,
          hostels: [],
        },
        "Eligible hostels fetched successfully",
      ),
    );
  }

  const hostels = await Hostel.find({
    hostel_id: { $in: eligibleHostelIds },
    gender: hostelStudent.gender,
  }).sort({ hostel_name: 1 });

  const roomSummaries = await Room.aggregate([
    {
      $match: {
        hostel_id: {
          $in: hostels.map((hostel) => hostel.hostel_id),
        },
      },
    },
    {
      $group: {
        _id: "$hostel_id",
        total_rooms: { $sum: 1 },
        total_capacity: { $sum: "$capacity" },
        available_beds: { $sum: "$available_beds" },
      },
    },
  ]);

  const summaryMap = new Map(
    roomSummaries.map((summary) => [summary._id, summary]),
  );
  const responseHostels = hostels.map((hostel) => {
    const summary = summaryMap.get(hostel.hostel_id) || {
      total_rooms: 0,
      total_capacity: 0,
      available_beds: 0,
    };

    return {
      hostel_id: hostel.hostel_id,
      hostel_name: hostel.hostel_name,
      gender: hostel.gender,
      floors: hostel.floors,
      total_rooms: summary.total_rooms,
      total_capacity: summary.total_capacity,
      available_beds: summary.available_beds,
      booking_window_open: bookingWindow.is_open,
      can_book: bookingWindow.is_open && summary.available_beds > 0,
    };
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        booking_window_open: bookingWindow.is_open,
        hostels: responseHostels,
      },
      "Eligible hostels fetched successfully",
    ),
  );
});

export const getEligibleHostelRooms = asyncHandler(async (req, res) => {
  await releaseExpiredPendingBookings();

  const hostelId = parseHostelId(req.params.hostelId);
  const Hostel = getHostelModel();
  const HostelAllowedYear = getHostelAllowedYearModel();
  const Room = getRoomModel();
  const bookingWindow = await getBookingWindow();
  const { hostelStudent } = req.user;

  const hostel = await Hostel.findOne({
    hostel_id: hostelId,
    gender: hostelStudent.gender,
  });

  if (!hostel) {
    throw new ApiError(404, "Eligible hostel not found");
  }

  const allowedYear = await HostelAllowedYear.findOne({
    hostel_id: hostelId,
    year: hostelStudent.year,
  });

  if (!allowedYear) {
    throw new ApiError(403, "Student is not eligible for this hostel");
  }

  const rooms = await Room.find({
    hostel_id: hostelId,
  }).sort({ room_number: 1 });
  const pricingMap = await getHostelPricingValueMap(hostelId);

  const responseRooms = rooms.map((room) => {
    const pricingCategory = getPricingCategoryKey({
      capacity: room.capacity,
      acType: room.ac_type,
    });

    return {
      ...room.toObject(),
      price: pricingMap.get(pricingCategory) ?? null,
      pricing_category: pricingCategory,
    };
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        booking_window_open: bookingWindow.is_open,
        hostel,
        rooms: responseRooms,
      },
      "Eligible hostel rooms fetched successfully",
    ),
  );
});
