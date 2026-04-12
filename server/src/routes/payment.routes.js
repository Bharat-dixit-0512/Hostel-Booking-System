import { Router } from "express";

import {
    confirmPayment,
    createPaymentSession,
    getPaymentStatus,
} from "../controllers/payment.controller.js";
import { LOGIN_TYPES } from "../constants.js";
import {
    authorizeLoginTypes,
    protect,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect, authorizeLoginTypes(LOGIN_TYPES.STUDENT));

router.post("/create-session", createPaymentSession);
router.post("/confirm", confirmPayment);
router.get("/:id/status", getPaymentStatus);

export default router;
