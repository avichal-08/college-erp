import type { WebSocket } from "ws";

import { validateAttendanceRequest } from "../middlewares/validateAttendance";
import type { AttendanceRequest } from "../middlewares/validateAttendance";
import type { ServerMessage } from "./protocol";
import { broadcast } from "./connections";
import { createSession, getSession, toView } from "./store";

function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function error(code: string, message: string, errors?: string[]): ServerMessage {
  return errors
    ? { type: "error", payload: { code, message, errors } }
    : { type: "error", payload: { code, message } };
}

/**
 * Teacher creates a new attendance session.
 * Validates the body; on failure returns field errors and does NOT broadcast.
 * On success: confirms to the teacher WITH the code, and notifies all
 * students of the new attendance WITHOUT the code.
 */
export function handleCreateAttendance(
  ws: WebSocket,
  payload: Record<string, unknown>,
): void {
  const body = payload as Partial<AttendanceRequest>;
  const errors = validateAttendanceRequest(body);
  if (errors.length > 0) {
    send(ws, error("VALIDATION_FAILED", "Validation failed", errors));
    return;
  }

  const normalized: AttendanceRequest = {
    subject: body.subject!.trim(),
    day: body.day!.trim().toLowerCase(),
    date: body.date!,
    timeSlot: body.timeSlot!.trim(),
    sectionType: body.sectionType!.trim().toLowerCase() as "lab" | "lecture",
  };

  const session = createSession(normalized);

  // Teacher-only: includes the code they relay verbally to students.
  send(ws, {
    type: "attendance_created",
    payload: { attendance: toView(session), code: session.code },
  });

  // Students: the live announcement, with NO code.
  broadcast("student", {
    type: "attendance_available",
    payload: { attendance: toView(session) },
  });
}

/**
 * Student submits the 6-digit code for an attendance session.
 * Handles every misfault: missing fields, bad code format, unknown
 * session, wrong code, and duplicate submission.
 */
export function handleSubmitCode(
  ws: WebSocket,
  payload: Record<string, unknown>,
): void {
  const { attendanceId, code, studentId } = payload;

  if (typeof attendanceId !== "string" || attendanceId.trim() === "") {
    send(ws, error("ATTENDANCE_ID_REQUIRED", "attendanceId is required (string)"));
    return;
  }
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    send(ws, error("INVALID_CODE_FORMAT", "Code must be exactly 6 digits"));
    return;
  }
  if (typeof studentId !== "string" || studentId.trim() === "") {
    send(ws, error("STUDENT_ID_REQUIRED", "studentId is required (string)"));
    return;
  }

  const session = getSession(attendanceId);
  if (!session) {
    send(ws, error("SESSION_NOT_FOUND", "No active attendance session found for this ID"));
    return;
  }

  if (session.studentsMarked.has(studentId)) {
    send(ws, error("ALREADY_MARKED", "You have already marked your attendance for this session"));
    return;
  }

  if (code !== session.code) {
    // Input error: attendance is NOT marked, student may retry.
    send(ws, error("INCORRECT_CODE", "Incorrect code. Attendance not marked."));
    return;
  }

  // Success.
  session.studentsMarked.add(studentId);
  send(ws, {
    type: "attendance_marked",
    payload: { attendanceId: session.id, studentId },
  });
  broadcast("teacher", {
    type: "student_marked",
    payload: {
      attendanceId: session.id,
      studentId,
      totalMarked: session.studentsMarked.size,
    },
  });
}
