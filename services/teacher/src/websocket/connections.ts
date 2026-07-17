import type { WebSocket } from "ws";

import type { ServerMessage } from "./protocol";
import type { SocketAuth } from "./auth";

// Registry of live socket connections keyed by socket, holding the
// verified identity established at connection time (see auth.ts).
const connections = new Map<WebSocket, SocketAuth>();

export function addConnection(ws: WebSocket, auth: SocketAuth): void {
  connections.set(ws, auth);
}

export function removeConnection(ws: WebSocket): void {
  connections.delete(ws);
}

export function getAuth(ws: WebSocket): SocketAuth | undefined {
  return connections.get(ws);
}

export function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/** Push to every connected student whose profile id is in the given set. */
export function sendToStudents(studentIds: Set<string>, message: ServerMessage): void {
  const data = JSON.stringify(message);
  for (const [ws, auth] of connections) {
    if (auth.role === "STUDENT" && studentIds.has(auth.studentProfileId) && ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  }
}

/** Push to every open tab a specific teacher has connected. */
export function sendToTeacher(teacherProfileId: string, message: ServerMessage): void {
  const data = JSON.stringify(message);
  for (const [ws, auth] of connections) {
    if (auth.role === "TEACHER" && auth.teacherProfileId === teacherProfileId && ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  }
}
