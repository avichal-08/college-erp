import type { Request, Response, NextFunction } from "express";

/**
 * Shape of an attendance creation request.
 */
export interface AttendanceRequest {
  subject: string;
  day: string;
  date: string;
  timeSlot: string; // e.g., "2pm-3pm"
  sectionType: "lab" | "lecture"; // lab or lecture
}

const VALID_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const VALID_SECTIONS = ["lab", "lecture"];

/**
 * Pure validation helper. Returns a list of error messages
 * (empty array when the body is valid).
 */
export function validateAttendanceRequest(
  body: Partial<AttendanceRequest>,
): string[] {
  const errors: string[] = [];

  // subject
  if (body.subject === undefined || body.subject === null) {
    errors.push("subject is required");
  } else if (typeof body.subject !== "string" || body.subject.trim() === "") {
    errors.push("subject must be a non-empty string");
  }

  // day
  if (body.day === undefined || body.day === null) {
    errors.push("day is required");
  } else if (
    typeof body.day !== "string" ||
    !VALID_DAYS.includes(body.day.trim().toLowerCase())
  ) {
    errors.push(`day must be one of: ${VALID_DAYS.join(", ")}`);
  }

  // date
  if (body.date === undefined || body.date === null) {
    errors.push("date is required");
  } else if (typeof body.date !== "string") {
    errors.push("date must be a string");
  } else if (isNaN(new Date(body.date).getTime())) {
    errors.push("date must be a valid date (e.g., YYYY-MM-DD)");
  }

  // timeSlot
  if (body.timeSlot === undefined || body.timeSlot === null) {
    errors.push("timeSlot is required");
  } else if (
    typeof body.timeSlot !== "string" ||
    body.timeSlot.trim() === ""
  ) {
    errors.push("timeSlot must be a non-empty string (e.g., '2pm-3pm')");
  }

  // sectionType
  if (body.sectionType === undefined || body.sectionType === null) {
    errors.push("sectionType is required");
  } else if (
    typeof body.sectionType !== "string" ||
    !VALID_SECTIONS.includes(body.sectionType.trim().toLowerCase())
  ) {
    errors.push(`sectionType must be one of: ${VALID_SECTIONS.join(", ")}`);
  }

  return errors;
}

/**
 * Express validator middleware for POST /teacher/attendance.
 * Responds with 400 + the collected errors when invalid,
 * otherwise calls next() so the controller can run.
 */
export function validateAttendance(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors = validateAttendanceRequest(req.body);
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }
  next();
}
