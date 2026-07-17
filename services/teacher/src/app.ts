import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ msg: "teacher service running", success: true });
});

// Attendance is entirely WebSocket-driven now (see src/websocket) — the
// old REST create-attendance endpoint was a disconnected, unpersisted
// parallel path and has been removed.
app.use(express.static(path.join(__dirname, "websocket", "public")));

export default app;
