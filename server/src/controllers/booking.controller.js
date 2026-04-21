import mongoose from "mongoose";

import { getBookingModel } from "../db/index.js";
import { REALTIME_EVENTS } from "../socket/events.js";
import { emitRealtimeEvent } from "../socket/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  cancelStudentBooking,
  createPendingStudentBooking,
  releaseExpiredPendingBookings,
} from "../utils/booking.utils.js";

export const createBooking = asyncHandler(async (req, res) => {
  const { hostel_id, room_number } = req.body;

  if (!Number.isInteger(Number(hostel_id)) || !room_number?.trim()) {
    throw new ApiError(400, "hostel_id and room_number are required");
  }

  const booking = await createPendingStudentBooking({
    rollNumber: req.user.roll_number,
    hostelId: Number(hostel_id),
    roomNumber: room_number.trim(),
  });

  emitRealtimeEvent(REALTIME_EVENTS.BOOKING_CHANGED, {
    action: "created",
    hostel_id: booking.hostel_id,
    room_number: booking.room_number,
    status: booking.status,
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        booking,
      },
      "Booking created successfully",
    ),
  );
});

export const getMyBookings = asyncHandler(async (req, res) => {
  await releaseExpiredPendingBookings();

  const Booking = getBookingModel();
  const bookings = await Booking.find({
    roll_number: req.user.roll_number,
  }).sort({ created_at: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
      },
      "Bookings fetched successfully",
    ),
  );
});

export const getAllBookings = asyncHandler(async (req, res) => {
  throw new ApiError(404, "Route not available");
});

export const cancelBooking = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Valid booking id is required");
  }

  const booking = await cancelStudentBooking({
    bookingId: req.params.id,
    rollNumber: req.user.roll_number,
  });

  emitRealtimeEvent(REALTIME_EVENTS.BOOKING_CHANGED, {
    action: "cancelled",
    hostel_id: booking.hostel_id,
    room_number: booking.room_number,
    status: booking.status,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        booking,
      },
      "Booking cancelled successfully",
    ),
  );
});
