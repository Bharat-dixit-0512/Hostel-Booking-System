import mongoose from "mongoose";

import { GENDERS } from "../constants.js";

const { Schema } = mongoose;

const hostelSchema = new Schema(
    {
        hostel_id: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },
        hostel_name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        gender: {
            type: String,
            enum: GENDERS,
            required: true,
            index: true,
        },
    },
    {
        versionKey: false,
    }
);

const registerHostelModel = (connection) =>
    connection.models.Hostel || connection.model("Hostel", hostelSchema, "hostels");

export default registerHostelModel;
