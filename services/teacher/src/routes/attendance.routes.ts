import { Router } from "express";

import { validateAttendance } from "../middlewares/validateAttendance";
import { createAttendance } from "../controllers/attendance.controller";

const router = Router();

router.post("/create-attendance", validateAttendance, createAttendance);

router.get("/test", (_req, res) => {
  res.send("Teacher attendance route working");
});

export default router;
