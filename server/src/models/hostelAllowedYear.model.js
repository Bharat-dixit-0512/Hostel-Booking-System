import mongoose from "mongoose";

import { STUDENT_YEARS } from "../constants.js";

const { Schema } = mongoose;

const hostelAllowedYearSchema = new Schema(
    {
        hostel_id: {
            type: Number,
            required: true,
            index: true,
        },
        year: {
            type: String,
            enum: STUDENT_YEARS,
            required: true,
            index: true,
        },
    },
    {
        versionKey: false,
    }
);

hostelAllowedYearSchema.index({ hostel_id: 1, year: 1 }, { unique: true });

const registerHostelAllowedYearModel = (connection) =>
    connection.models.HostelAllowedYear ||
    connection.model("HostelAllowedYear", hostelAllowedYearSchema, "hostel_allowed_years");

export default registerHostelAllowedYearModel;
