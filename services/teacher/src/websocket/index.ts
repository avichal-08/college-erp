import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";

import type { Role } from "./protocol";
import { parseClientMessage } from "./protocol";
import { addConnection, removeConnection } from "./connections";
import { handleCreateAttendance, handleSubmitCode } from "./handlers";
import { listSessions, toView } from "./store";

type Socket = WebSocket & { isAlive?: boolean };

function parseRole(url: string | undefined): Role | null {
  if (!url) return null;
  const role = new URL(url, "http://localhost").searchParams.get("role");
  return role === "teacher" || role === "student" ? role : null;
}

function sendError(ws: WebSocket, code: string, message: string): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type: "error", payload: { code, message } }));
  }
}

/**
 * Attach the attendance WebSocket server to the existing HTTP server
 * so it shares the Express port. Clients connect to `/ws?role=teacher`
 * or `/ws?role=student`.
 */
export function createWebSocketServer(server: Server, path = "/ws"): WebSocketServer {
  const wss = new WebSocketServer({ server, path });

  wss.on("connection", (ws: Socket, req) => {
    const role = parseRole(req.url);
    if (!role) {
      sendError(ws, "ROLE_REQUIRED", "Connect with ?role=teacher or ?role=student");
      ws.close(1008, "role required");
      return;
    }

    addConnection(ws, role);
    ws.isAlive = true;

    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "connected", payload: { role } }));
    }

    // Late-join: a student connecting after attendance was created still
    // receives every currently-active session.
    if (role === "student") {
      for (const session of listSessions()) {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: "attendance_available",
            payload: { attendance: toView(session) },
          }));
        }
      }
    }

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (raw) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw.toString());
      } catch {
        sendError(ws, "INVALID_JSON", "Message must be valid JSON");
        return;
      }

      const msg = parseClientMessage(parsed);
      if ("error" in msg) {
        sendError(ws, "BAD_MESSAGE", msg.error);
        return;
      }

      // Role enforcement.
      if (msg.type === "create_attendance" && role !== "teacher") {
        sendError(ws, "FORBIDDEN", "Only teachers can create attendance");
        return;
      }
      if (msg.type === "submit_code" && role !== "student") {
        sendError(ws, "FORBIDDEN", "Only students can submit a code");
        return;
      }

      if (msg.type === "create_attendance") {
        handleCreateAttendance(ws, msg.payload);
      } else {
        handleSubmitCode(ws, msg.payload);
      }
    });

    const cleanup = () => removeConnection(ws);
    ws.on("close", cleanup);
    ws.on("error", cleanup);
  });

  // Heartbeat: terminate connections that stopped responding.
  const heartbeat = setInterval(() => {
    wss.clients.forEach((client) => {
      const sock = client as Socket;
      if (sock.isAlive === false) {
        sock.terminate();
        return;
      }
      sock.isAlive = false;
      if (client.readyState === client.OPEN) client.ping();
    });
  }, 30_000);

  wss.on("close", () => clearInterval(heartbeat));

  return wss;
}
