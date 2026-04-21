import mongoose from "mongoose";

import { BOOKING_STATUSES } from "../constants.js";
import { getBookingModel } from "../db/index.js";
import { REALTIME_EVENTS } from "../socket/events.js";
import { emitRealtimeEvent } from "../socket/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  confirmBookingPayment,
  releaseExpiredPendingBookings,
} from "../utils/booking.utils.js";

export const createPaymentSession = asyncHandler(async (req, res) => {
  const { booking_id } = req.body;

  if (!mongoose.isValidObjectId(booking_id)) {
    throw new ApiError(400, "Valid booking_id is required");
  }

  await releaseExpiredPendingBookings();

  const Booking = getBookingModel();
  const booking = await Booking.findOne({
    _id: booking_id,
    roll_number: req.user.roll_number,
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status !== BOOKING_STATUSES.PENDING) {
    throw new ApiError(
      409,
      `Payment cannot be created for ${booking.status.toLowerCase().replaceAll("_", " ")} booking`,
    );
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        booking_id: booking._id,
        status: booking.status,
        amount: booking.price ?? 0,
        currency: "INR",
        expires_at: booking.expires_at,
        gateway: "placeholder",
        session_id: `demo_${booking._id}`,
      },
      "Payment session created",
    ),
  );
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const { booking_id, payment_reference } = req.body;

  if (!mongoose.isValidObjectId(booking_id)) {
    throw new ApiError(400, "Valid booking_id is required");
  }

  const booking = await confirmBookingPayment({
    bookingId: booking_id,
    rollNumber: req.user.roll_number,
    paymentReference: payment_reference,
  });

  emitRealtimeEvent(REALTIME_EVENTS.BOOKING_CHANGED, {
    action: "confirmed",
    hostel_id: booking.hostel_id,
    room_number: booking.room_number,
    status: booking.status,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        booking,
      },
      "Payment confirmed successfully",
    ),
  );
});

export const getPaymentStatus = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Valid booking id is required");
  }

  await releaseExpiredPendingBookings();

  const Booking = getBookingModel();
  const booking = await Booking.findOne({
    _id: req.params.id,
    roll_number: req.user.roll_number,
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        booking_id: booking._id,
        status: booking.status,
        amount: booking.price ?? 0,
        currency: "INR",
        payment_reference: booking.payment_reference || null,
        expires_at: booking.expires_at || null,
      },
      "Payment status fetched successfully",
    ),
  );
});
