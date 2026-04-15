import mongoose from "mongoose";

import { ADMIN_ROLES } from "../constants.js";

const { Schema } = mongoose;

const authAdminSchema = new Schema(
    {
        employee_id: {
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
        role: {
            type: String,
            enum: Object.values(ADMIN_ROLES),
            required: true,
            index: true,
        },
    },
    {
        versionKey: false,
    }
);

const registerAuthAdminModel = (connection) =>
    connection.models.AuthAdmin || connection.model("AuthAdmin", authAdminSchema, "admins");

export default registerAuthAdminModel;
