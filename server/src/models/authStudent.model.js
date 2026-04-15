import mongoose from "mongoose";

import { GENDERS, RESIDENCE_TYPES, STUDENT_YEARS } from "../constants.js";

const { Schema } = mongoose;

const authStudentSchema = new Schema(
    {
        roll_number: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        token_version: {
            type: Number,
            required: true,
            default: 0,
        },
        year: {
            type: String,
            enum: STUDENT_YEARS,
            required: true,
        },
        residence: {
            type: String,
            enum: Object.values(RESIDENCE_TYPES),
            required: true,
        },
        gender: {
            type: String,
            enum: GENDERS,
            required: true,
        },
    },
    {
        versionKey: false,
    }
);

const registerAuthStudentModel = (connection) =>
    connection.models.AuthStudent ||
    connection.model("AuthStudent", authStudentSchema, "students");

export default registerAuthStudentModel;
