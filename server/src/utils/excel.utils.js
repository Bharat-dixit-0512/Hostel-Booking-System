import xlsx from "xlsx";

import {
  MAX_HOSTEL_FLOORS,
  MAX_ROOM_CAPACITY,
  ROOM_IMPORT_HEADER_ALIASES,
} from "../constants.js";
import ApiError from "./ApiError.js";

const normalizeHeader = (headerValue) =>
  String(headerValue || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const findMatchingHeader = (headers, aliases) =>
  headers.find((header) => aliases.includes(normalizeHeader(header)));

const parseAcType = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  const normalizedValue = String(value ?? "")
    .trim()
    .toLowerCase();

  if (["true", "yes", "y", "1", "ac"].includes(normalizedValue)) {
    return true;
  }

  if (
    ["false", "no", "n", "0", "nonac", "non-ac", "non ac"].includes(
      normalizedValue,
    )
  ) {
    return false;
  }

  throw new ApiError(400, `Invalid AC type value: ${value}`);
};

const isEmptyCellValue = (value) =>
  value === null || value === undefined || String(value).trim() === "";

const isEmptyRow = (row) => Object.values(row).every(isEmptyCellValue);

const getRoomImportWorksheetRows = (fileBuffer) => {
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });
  const worksheetName = workbook.SheetNames[0];

  if (!worksheetName) {
    throw new ApiError(400, "Excel file does not contain any worksheet");
  }

  const worksheet = workbook.Sheets[worksheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet, {
    defval: null,
    raw: false,
  });

  if (rows.length === 0) {
    throw new ApiError(400, "Excel file does not contain any room rows");
  }

  return rows;
};

export const parseRoomImportWorkbookWithWarnings = (fileBuffer) => {
  const rows = getRoomImportWorksheetRows(fileBuffer);

  const headers = Object.keys(rows[0]);
  const roomNumberHeader = findMatchingHeader(
    headers,
    ROOM_IMPORT_HEADER_ALIASES.room_number,
  );
  const capacityHeader = findMatchingHeader(
    headers,
    ROOM_IMPORT_HEADER_ALIASES.capacity,
  );
  const acTypeHeader = findMatchingHeader(
    headers,
    ROOM_IMPORT_HEADER_ALIASES.ac_type,
  );
  const floorHeader = findMatchingHeader(
    headers,
    ROOM_IMPORT_HEADER_ALIASES.floor,
  );

  if (!roomNumberHeader || !capacityHeader || !acTypeHeader || !floorHeader) {
    throw new ApiError(
      400,
      "Excel headers must include room number, capacity, AC type, and floor",
    );
  }

  const roomRows = [];
  const warnings = [];
  let emptyRowsSkipped = 0;

  rows.forEach((row, index) => {
    if (isEmptyRow(row)) {
      emptyRowsSkipped += 1;
      return;
    }

    const roomNumber = String(row[roomNumberHeader] ?? "").trim();
    const capacity = Number(row[capacityHeader]);
    const floor = Number(row[floorHeader]);

    if (!roomNumber) {
      warnings.push(`Row ${index + 2} skipped: room number is required`);
      return;
    }

    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > MAX_ROOM_CAPACITY
    ) {
      warnings.push(
        `Row ${index + 2} skipped: capacity must be a positive integer up to ${MAX_ROOM_CAPACITY}`,
      );
      return;
    }

    if (!Number.isInteger(floor) || floor < 0 || floor >= MAX_HOSTEL_FLOORS) {
      warnings.push(
        `Row ${index + 2} skipped: floor must be an integer between 0 and ${MAX_HOSTEL_FLOORS - 1}`,
      );
      return;
    }

    try {
      roomRows.push({
        room_number: roomNumber,
        capacity,
        ac_type: parseAcType(row[acTypeHeader]),
        floor,
      });
    } catch (error) {
      warnings.push(`Row ${index + 2} skipped: ${error.message}`);
    }
  });

  return {
    roomRows,
    warnings,
    totalRows: rows.length,
    emptyRowsSkipped,
  };
};

export const parseRoomImportWorkbook = (fileBuffer) => {
  const { roomRows, warnings } =
    parseRoomImportWorkbookWithWarnings(fileBuffer);

  if (warnings.length > 0) {
    throw new ApiError(400, "Excel file contains invalid room rows", warnings);
  }

  return roomRows;
};
