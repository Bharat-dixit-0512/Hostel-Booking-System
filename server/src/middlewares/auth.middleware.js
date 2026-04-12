import { LOGIN_TYPES } from "../constants.js";
import {
    getAuthAdminModel,
    getAuthStudentModel,
    getHostelStudentModel,
} from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

const extractAccessToken = (req) => {
    const authorizationHeader = req.header("Authorization");

    if (authorizationHeader?.startsWith("Bearer ")) {
        return authorizationHeader.slice(7).trim();
    }

    return req.cookies?.accessToken;
};

export const protect = asyncHandler(async (req, _res, next) => {
    const token = extractAccessToken(req);

    if (!token) {
        throw new ApiError(401, "Authentication required");
    }

    const decodedToken = verifyAccessToken(token);

    if (decodedToken.login_type === LOGIN_TYPES.STUDENT) {
        const AuthStudent = getAuthStudentModel();
        const HostelStudent = getHostelStudentModel();
        const authStudent = await AuthStudent.findOne({
            roll_number: decodedToken.roll_number,
        });
        const hostelStudent = await HostelStudent.findOne({
            roll_number: decodedToken.roll_number,
        });

        if (!authStudent) {
            throw new ApiError(401, "Student profile not found");
        }

        if ((authStudent.token_version ?? 0) !== (decodedToken.token_version ?? 0)) {
            throw new ApiError(401, "Access token has been logged out");
        }

        if (!hostelStudent) {
            throw new ApiError(401, "Student profile not found");
        }

        req.user = {
            ...decodedToken,
            hostelStudent,
        };
    } else if (decodedToken.login_type === LOGIN_TYPES.ADMIN) {
        const AuthAdmin = getAuthAdminModel();
        const admin = await AuthAdmin.findOne({
            employee_id: decodedToken.employee_id,
        });

        if (!admin) {
            throw new ApiError(401, "Admin profile not found");
        }

        if ((admin.token_version ?? 0) !== (decodedToken.token_version ?? 0)) {
            throw new ApiError(401, "Access token has been logged out");
        }

        req.user = {
            ...decodedToken,
            role: admin.role,
            admin,
        };
    } else {
        throw new ApiError(401, "Invalid authentication token");
    }

    next();
});

export const authorizeLoginTypes = (...allowedLoginTypes) => (req, _res, next) => {
    if (!req.user) {
        return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedLoginTypes.includes(req.user.login_type)) {
        return next(new ApiError(403, "You are not allowed to access this resource"));
    }

    return next();
};

export const authorizeAdminRoles = (...allowedRoles) => (req, _res, next) => {
    if (!req.user || req.user.login_type !== LOGIN_TYPES.ADMIN) {
        return next(new ApiError(401, "Admin authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
        return next(new ApiError(403, "You are not allowed to access this resource"));
    }

    return next();
};
