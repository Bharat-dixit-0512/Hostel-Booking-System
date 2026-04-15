import mongoose from "mongoose";

import ApiError from "../utils/ApiError.js";

const getDuplicateSources = (error) =>
    [
        error?.keyPattern,
        error?.errorResponse?.keyPattern,
        error?.keyValue,
        error?.errorResponse?.keyValue,
    ].filter(Boolean);

const hasDuplicateFields = (duplicateSources, fields) =>
    duplicateSources.some((source) =>
        fields.every((field) => Object.prototype.hasOwnProperty.call(source, field))
    );

const formatDuplicateKeyMessage = (error) => {
    const duplicateSources = getDuplicateSources(error);

    if (hasDuplicateFields(duplicateSources, ["hostel_id", "room_number"])) {
        return "Room already exists in this hostel";
    }

    if (hasDuplicateFields(duplicateSources, ["hostel_id", "year"])) {
        return "Allowed year already exists for this hostel";
    }

    const duplicateField = duplicateSources
        .flatMap((source) => Object.keys(source))
        .find(Boolean);

    if (duplicateField) {
        return `${duplicateField} already exists`;
    }

    const indexName = error?.message?.match(/index:\s+([^\s]+)\s+dup key/i)?.[1];

    if (indexName) {
        return `${indexName.replace(/_1$/, "")} already exists`;
    }

    return "Duplicate value found";
};

export const notFoundHandler = (req, _res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, _req, res, _next) => {
    let normalizedError = error;

    if (!(normalizedError instanceof ApiError)) {
        if (normalizedError instanceof mongoose.Error.ValidationError) {
            normalizedError = new ApiError(
                400,
                "Validation failed",
                Object.values(normalizedError.errors).map((item) => item.message)
            );
        } else if (normalizedError instanceof mongoose.Error.CastError) {
            normalizedError = new ApiError(400, `Invalid ${normalizedError.path}`);
        } else if (normalizedError?.code === 11000) {
            normalizedError = new ApiError(409, formatDuplicateKeyMessage(normalizedError));
        } else if (
            normalizedError?.name === "JsonWebTokenError" ||
            normalizedError?.name === "TokenExpiredError"
        ) {
            normalizedError = new ApiError(401, "Invalid or expired access token");
        } else {
            normalizedError = new ApiError(
                normalizedError?.statusCode || 500,
                normalizedError?.message || "Internal server error"
            );
        }
    }

    res.status(normalizedError.statusCode).json({
        success: false,
        message: normalizedError.message,
        errors: normalizedError.errors || [],
    });
};
