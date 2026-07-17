import type { WebSocket } from "ws";

import type { Role, ServerMessage } from "./protocol";

// Registry of live socket connections keyed by their role.
const connections = new Map<WebSocket, Role>();

export function addConnection(ws: WebSocket, role: Role): void {
  connections.set(ws, role);
}

export function removeConnection(ws: WebSocket): void {
  connections.delete(ws);
}

/**
 * Send a message to every connected client of a given role.
 * Used to push live attendance updates to all students, and
 * marked-attendance notifications to all teachers.
 */
export function broadcast(role: Role, message: ServerMessage): void {
  const data = JSON.stringify(message);
  for (const [ws, r] of connections) {
    if (r === role && ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  }
}
