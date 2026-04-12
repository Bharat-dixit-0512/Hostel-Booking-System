import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import adminRouter from "./routes/admin.routes.js";
import authRouter from "./routes/auth.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import hostelRouter from "./routes/hostel.routes.js";
import paymentRouter from "./routes/payment.routes.js";

const app = express();
const cookieSecret = process.env.COOKIE_SECRET?.trim();

const allowedOrigins = (
    process.env.CORS_ORIGIN ||
    process.env.CLIENT_URL ||
    "http://localhost:3000,http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("/{*corsPath}", cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser(cookieSecret));

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});

app.use("/api/auth", authRouter);
app.use("/api/hostels", hostelRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
