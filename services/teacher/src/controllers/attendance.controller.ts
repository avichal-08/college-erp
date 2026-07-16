import type { Request, Response } from "express";
import type { AttendanceRequest } from "../middlewares/validateAttendance";

/**
 * POST /teacher/attendance
 *
 * Creates a new attendance session. The incoming body is already
 * validated by the `validateAttendance` middleware, so by the time
 * we reach here every field is present and well-formed.
 */
export async function createAttendance(
  req: Request,
  res: Response,
): Promise<void> {
  const body = req.body as Partial<AttendanceRequest>;

  const normalized: AttendanceRequest = {
    subject: body.subject!.trim(),
    day: body.day!.trim().toLowerCase(),
    date: body.date!,
    timeSlot: body.timeSlot!.trim(),
    sectionType: body.sectionType!.trim().toLowerCase() as "lab" | "lecture",
  };

  const attendanceCode = Math.floor(100000 + Math.random() * 900000).toString();

// Code expires after 30 seconds
const expiresAt = new Date(Date.now() + 30 * 1000);

// Log it
console.log(
  `Attendance Code: ${attendanceCode} | Expires At: ${expiresAt.toLocaleTimeString()}`
);
  // TODO: persist `normalized` to the database once an attendance
  // table exists in @repo/db, e.g.
  //   await db.insert(attendances).values(normalized);
  // For now we echo the validated, normalized payload back.

  res.status(201).json({
    success: true,
    message: "Attendance created successfully",
    data: normalized,
    attendanceCode,
    expiresIn: 30,
  });
}
