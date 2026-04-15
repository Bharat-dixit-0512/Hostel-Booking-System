import mongoose from "mongoose";

import { GENDERS, STUDENT_YEARS } from "../constants.js";

const { Schema } = mongoose;

const hostelStudentSchema = new Schema(
    {
        roll_number: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },
        year: {
            type: String,
            enum: STUDENT_YEARS,
            required: true,
            index: true,
        },
        gender: {
            type: String,
            enum: GENDERS,
            required: true,
            index: true,
        },
        room_allocated: {
            type: Boolean,
            default: false,
            index: true,
        },
        hostel_id: {
            type: Number,
            default: null,
            index: true,
        },
        room_number: {
            type: String,
            default: null,
        },
    },
    {
        versionKey: false,
    }
);

hostelStudentSchema.index({ hostel_id: 1, room_number: 1 });

const registerHostelStudentModel = (connection) =>
    connection.models.HostelStudent ||
    connection.model("HostelStudent", hostelStudentSchema, "hostel_students");

export default registerHostelStudentModel;
