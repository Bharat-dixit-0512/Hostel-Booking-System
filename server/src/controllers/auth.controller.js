import { LOGIN_TYPES, RESIDENCE_TYPES } from "../constants.js";
import { getAuthAdminModel, getAuthStudentModel } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { formatStudentJwtPayload, syncHostelStudentFromAuthStudent } from "../utils/booking.utils.js";
import { clearAuthCookie, setAuthCookie, signAccessToken } from "../utils/jwt.js";
import { verifyPassword } from "../utils/password.js";

const formatAdminJwtPayload = (authAdmin) => ({
    login_type: LOGIN_TYPES.ADMIN,
    employee_id: authAdmin.employee_id,
    name: authAdmin.name,
    email: authAdmin.email,
    role: authAdmin.role,
    token_version: authAdmin.token_version ?? 0,
});

export const loginStudent = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
        throw new ApiError(400, "email and password are required");
    }

    const AuthStudent = getAuthStudentModel();
    const normalizedEmail = email.trim().toLowerCase();
    const authStudent = await AuthStudent.findOne({
        email: normalizedEmail,
    }).select("+password");

    if (!authStudent || !(await verifyPassword(password.trim(), authStudent.password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (authStudent.residence !== RESIDENCE_TYPES.HOSTLER) {
        throw new ApiError(403, "Only hostler students can log in to this system");
    }

    await syncHostelStudentFromAuthStudent(authStudent);

    const accessToken = signAccessToken(formatStudentJwtPayload(authStudent));
    setAuthCookie(res, accessToken);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: {
                    login_type: LOGIN_TYPES.STUDENT,
                    roll_number: authStudent.roll_number,
                    name: authStudent.name,
                    email: authStudent.email,
                    year: authStudent.year,
                    gender: authStudent.gender,
                },
                accessToken,
            },
            "Student login successful"
        )
    );
});

export const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
        throw new ApiError(400, "email and password are required");
    }

    const AuthAdmin = getAuthAdminModel();
    const normalizedEmail = email.trim().toLowerCase();
    const authAdmin = await AuthAdmin.findOne({
        email: normalizedEmail,
    }).select("+password");

    if (!authAdmin || !(await verifyPassword(password.trim(), authAdmin.password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = signAccessToken(formatAdminJwtPayload(authAdmin));
    setAuthCookie(res, accessToken);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: {
                    login_type: LOGIN_TYPES.ADMIN,
                    employee_id: authAdmin.employee_id,
                    name: authAdmin.name,
                    email: authAdmin.email,
                    role: authAdmin.role,
                },
                accessToken,
            },
            "Admin login successful"
        )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
    if (req.user?.login_type === LOGIN_TYPES.STUDENT) {
        const AuthStudent = getAuthStudentModel();

        await AuthStudent.updateOne(
            { roll_number: req.user.roll_number },
            { $inc: { token_version: 1 } }
        );
    } else if (req.user?.login_type === LOGIN_TYPES.ADMIN) {
        const AuthAdmin = getAuthAdminModel();

        await AuthAdmin.updateOne(
            { employee_id: req.user.employee_id },
            { $inc: { token_version: 1 } }
        );
    }

    clearAuthCookie(res);

    res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: req.user,
            },
            "Profile fetched successfully"
        )
    );
});
