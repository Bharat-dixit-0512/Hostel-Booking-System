import { Router } from "express";

import {
    getCurrentUser,
    loginAdmin,
    loginStudent,
    logoutUser,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/student/login", loginStudent);
router.post("/admin/login", loginAdmin);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getCurrentUser);

export default router;
