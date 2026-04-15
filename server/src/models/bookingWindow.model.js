import mongoose from "mongoose";

import { BOOKING_WINDOW_KEY } from "../constants.js";

const { Schema } = mongoose;

const bookingWindowSchema = new Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: BOOKING_WINDOW_KEY,
        },
        is_open: {
            type: Boolean,
            required: true,
            default: false,
        },
        updated_by_type: {
            type: String,
            default: null,
        },
        updated_by_id: {
            type: String,
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

const registerBookingWindowModel = (connection) =>
    connection.models.BookingWindow ||
    connection.model("BookingWindow", bookingWindowSchema, "booking_windows");

export default registerBookingWindowModel;
