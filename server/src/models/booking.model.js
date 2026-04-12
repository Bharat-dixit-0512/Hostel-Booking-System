import mongoose from "mongoose";

import {
    ACTIVE_BOOKING_STATUSES,
    BOOKED_BY_TYPES,
    BOOKING_SOURCES,
    BOOKING_STATUSES,
} from "../constants.js";

const { Schema } = mongoose;

const bookingSchema = new Schema(
    {
        roll_number: {
            type: Number,
            required: true,
            index: true,
        },
        hostel_id: {
            type: Number,
            required: true,
            index: true,
        },
        room_number: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(BOOKING_STATUSES),
            required: true,
            index: true,
        },
        source: {
            type: String,
            enum: Object.values(BOOKING_SOURCES),
            required: true,
        },
        booked_by_type: {
            type: String,
            enum: Object.values(BOOKED_BY_TYPES),
            required: true,
        },
        booked_by_id: {
            type: String,
            required: true,
            trim: true,
        },
        payment_reference: {
            type: String,
            trim: true,
            default: null,
        },
        expires_at: {
            type: Date,
            default: null,
        },
        confirmed_at: {
            type: Date,
            default: null,
        },
        cancelled_at: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
        versionKey: false,
    }
);

bookingSchema.index({ status: 1, expires_at: 1 });
bookingSchema.index({ hostel_id: 1, room_number: 1, status: 1 });
bookingSchema.index(
    { roll_number: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: {
                $in: ACTIVE_BOOKING_STATUSES,
            },
        },
    }
);

const registerBookingModel = (connection) =>
    connection.models.Booking || connection.model("Booking", bookingSchema, "bookings");

export default registerBookingModel;
