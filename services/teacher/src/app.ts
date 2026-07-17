import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import attendanceRoutes from "./routes/attendance.routes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ msg: "teacher service running", success: true });
});

app.use("/teacher", attendanceRoutes);

app.use(express.static(path.join(__dirname, "websocket", "public")));

export default app;
