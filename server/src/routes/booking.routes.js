import { Router } from "express";

import {
    cancelBooking,
    createBooking,
    getMyBookings,
} from "../controllers/booking.controller.js";
import { LOGIN_TYPES } from "../constants.js";
import {
    authorizeLoginTypes,
    protect,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect, authorizeLoginTypes(LOGIN_TYPES.STUDENT));

router.post("/", createBooking);
router.get("/me", getMyBookings);
router.put("/:id/cancel", cancelBooking);

export default router;
