export const AUTH_DB_NAME = "AuthDB";
export const HOSTEL_DB_NAME = "HostelDB";

export const LOGIN_TYPES = Object.freeze({
    STUDENT: "student",
    ADMIN: "admin",
});

export const ADMIN_ROLES = Object.freeze({
    SUBADMIN: "subadmin",
    MAINADMIN: "mainadmin",
});

export const STUDENT_YEARS = Object.freeze(["1st", "2nd", "3rd", "4th"]);
export const GENDERS = Object.freeze(["male", "female"]);

export const RESIDENCE_TYPES = Object.freeze({
    HOSTLER: "hostler",
    DAYSCHOLAR: "dayscholar",
});

export const BOOKING_STATUSES = Object.freeze({
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    EXPIRED: "EXPIRED",
    CANCELLED: "CANCELLED",
});

export const ACTIVE_BOOKING_STATUSES = Object.freeze([
    BOOKING_STATUSES.PENDING,
    BOOKING_STATUSES.CONFIRMED,
]);

export const BOOKING_SOURCES = Object.freeze({
    ONLINE: "online",
    OFFLINE: "offline",
});

export const BOOKED_BY_TYPES = Object.freeze({
    STUDENT: "student",
    ADMIN: "admin",
});

export const HOLD_MINUTES = 10;

export const BOOKING_WINDOW_KEY = "global_booking_window";
export const HOSTEL_COUNTER_KEY = "hostel_id";
export const MAX_ROOM_CAPACITY = 3;

export const ROOM_IMPORT_HEADER_ALIASES = Object.freeze({
    room_number: [
        "room_number",
        "room number",
        "room no",
        "room_no",
        "roomno",
        "room",
    ],
    capacity: [
        "capacity",
        "beds",
        "bed count",
        "bed_count",
        "total_beds",
        "total beds",
        "total_bed",
        "total bed",
    ],
    ac_type: [
        "ac_type",
        "ac",
        "is_ac",
        "is ac",
        "isac",
        "ac type",
        "ac status",
    ],
});
