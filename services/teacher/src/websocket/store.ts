import crypto from "node:crypto";

import type { AttendanceView } from "./protocol";

export interface AttendanceSession {
  id: string;
  subject: string;
  day: string;
  date: string;
  timeSlot: string;
  sectionType: "lab" | "lecture";
  /** 6-digit code. NEVER sent to students — only the teacher sees it. */
  code: string;
  createdAt: string;
  studentsMarked: Set<string>;
}

// In-memory store. Replace with @repo/db persistence when an
// `attendances` table exists.
const sessions = new Map<string, AttendanceSession>();

export function createSession(input: {
  subject: string;
  day: string;
  date: string;
  timeSlot: string;
  sectionType: "lab" | "lecture";
}): AttendanceSession {
  const session: AttendanceSession = {
    id: crypto.randomUUID(),
    ...input,
    code: generateUniqueCode(),
    createdAt: new Date().toISOString(),
    studentsMarked: new Set(),
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): AttendanceSession | undefined {
  return sessions.get(id);
}

export function listSessions(): AttendanceSession[] {
  return [...sessions.values()];
}

export function toView(session: AttendanceSession): AttendanceView {
  return {
    id: session.id,
    subject: session.subject,
    day: session.day,
    date: session.date,
    timeSlot: session.timeSlot,
    sectionType: session.sectionType,
    createdAt: session.createdAt,
  };
}

// 6-digit code (may include leading zeros), guaranteed unique among live sessions.
function generateUniqueCode(): string {
  let code = "";
  do {
    code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  } while ([...sessions.values()].some((s) => s.code === code));
  return code;
}
