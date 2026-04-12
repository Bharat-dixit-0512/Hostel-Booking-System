import jwt from "jsonwebtoken";

const DEFAULT_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getJwtSecret = () => process.env.JWT_SECRET || "development_jwt_secret";

export const signAccessToken = (payload) =>
    jwt.sign(payload, getJwtSecret(), {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });

export const verifyAccessToken = (token) => jwt.verify(token, getJwtSecret());

export const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DEFAULT_COOKIE_MAX_AGE,
});

export const setAuthCookie = (res, token) => {
    res.cookie("accessToken", token, getAuthCookieOptions());
};

export const clearAuthCookie = (res) => {
    res.clearCookie("accessToken", getAuthCookieOptions());
};
