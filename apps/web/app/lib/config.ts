// Service URLs. Overridable via env for anything other than local dev,
// where auth-service and teacher-service run on their default ports.
export const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://localhost:5000";

export const TEACHER_SERVICE_WS_URL =
  process.env.NEXT_PUBLIC_TEACHER_WS_URL ?? "ws://localhost:5001/ws";
