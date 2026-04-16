import { Router } from "express";
import multer from "multer";

import {
    createHostel,
    deleteHostel,
    createOfflineBookingController,
    getHostelPricing,
    listEligibleStudents,
    listBookings,
    getBookingWindowStatus,
    listHostels,
    replaceAllowedYears,
    resetSessionData,
    updateBookingWindow,
    updateHostel,
    updateHostelPricing,
} from "../controllers/admin.controller.js";
import {
    createRoom,
    deleteRoom,
    confirmRoomImport,
    getRoomsByHostel,
    previewRoomImport,
    updateRoom,
} from "../controllers/room.controller.js";
import { ADMIN_ROLES, LOGIN_TYPES } from "../constants.js";
import {
    authorizeAdminRoles,
    authorizeLoginTypes,
    protect,
} from "../middlewares/auth.middleware.js";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
});

router.use(protect, authorizeLoginTypes(LOGIN_TYPES.ADMIN));

router.get("/hostels", listHostels);
router.get("/bookings", listBookings);
router.get("/eligible-students", listEligibleStudents);
router.get("/hostels/:hostelId/rooms", getRoomsByHostel);
router.get("/hostels/:hostelId/pricing", getHostelPricing);
router.get("/booking-window", getBookingWindowStatus);
router.post("/offline-bookings", createOfflineBookingController);

router.post(
    "/hostels",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    createHostel
);
router.put(
    "/hostels/:hostelId",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    updateHostel
);
router.delete(
    "/hostels/:hostelId",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    deleteHostel
);
router.put(
    "/hostels/:hostelId/pricing",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    updateHostelPricing
);
router.put(
    "/hostels/:hostelId/allowed-years",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    replaceAllowedYears
);
router.post(
    "/hostels/:hostelId/rooms",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    createRoom
);
router.put(
    "/hostels/:hostelId/rooms/:roomNumber",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    updateRoom
);
router.delete(
    "/hostels/:hostelId/rooms/:roomNumber",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    deleteRoom
);
router.post(
    "/hostels/:hostelId/rooms/import/preview",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    upload.single("file"),
    previewRoomImport
);
router.post(
    "/hostels/:hostelId/rooms/import/confirm",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    upload.single("file"),
    confirmRoomImport
);
router.patch(
    "/booking-window",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    updateBookingWindow
);
router.post(
    "/session/reset",
    authorizeAdminRoles(ADMIN_ROLES.MAINADMIN),
    resetSessionData
);

export default router;
