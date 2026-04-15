import { Router } from "express";

import {
    getEligibleHostelRooms,
    getEligibleHostels,
} from "../controllers/hostel.controller.js";
import { LOGIN_TYPES } from "../constants.js";
import {
    authorizeLoginTypes,
    protect,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect, authorizeLoginTypes(LOGIN_TYPES.STUDENT));

router.get("/", getEligibleHostels);
router.get("/:hostelId/rooms", getEligibleHostelRooms);

export default router;
