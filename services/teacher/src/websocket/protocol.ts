// Shared message protocol between WebSocket clients and the server.

export type Role = "teacher" | "student";

// Client -> Server
export type ClientMessage =
  | { type: "create_attendance"; payload: Record<string, unknown> }
  | { type: "submit_code"; payload: Record<string, unknown> };

// The attendance shape broadcast to students (deliberately EXCLUDES the code).
export interface AttendanceView {
  id: string;
  subject: string;
  day: string;
  date: string;
  timeSlot: string;
  sectionType: "lab" | "lecture";
  createdAt: string;
}

// Server -> Client
export type ServerMessage =
  | { type: "connected"; payload: { role: Role } }
  | { type: "attendance_created"; payload: { attendance: AttendanceView; code: string } } // teacher only (has code)
  | { type: "attendance_available"; payload: { attendance: AttendanceView } } // students (no code)
  | { type: "attendance_marked"; payload: { attendanceId: string; studentId: string } } // student who submitted
  | { type: "student_marked"; payload: { attendanceId: string; studentId: string; totalMarked: number } } // teachers
  | { type: "error"; payload: { code?: string; message: string; errors?: string[] } };

/**
 * Validate that a raw parsed JSON object is a recognizable client message.
 * Returns a discriminated error object when it is not.
 */
export function parseClientMessage(
  data: unknown,
): ClientMessage | { error: string } {
  if (typeof data !== "object" || data === null) {
    return { error: "Message must be a JSON object" };
  }

  const msg = data as Record<string, unknown>;

  if (typeof msg.type !== "string") {
    return { error: "Missing or invalid 'type' field" };
  }

  if (msg.type !== "create_attendance" && msg.type !== "submit_code") {
    return { error: `Unknown message type: '${msg.type}'` };
  }

  if (typeof msg.payload !== "object" || msg.payload === null) {
    return { error: "Missing or invalid 'payload' object" };
  }

  return msg as ClientMessage;
}
