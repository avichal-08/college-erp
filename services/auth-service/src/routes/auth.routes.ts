import { Router } from "express";

import * as authController from "../controllers/auth.controllers";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/login",
  authController.login
);

router.get(
  "/me",
  authenticate,
  authController.me
);

router.get("/test", (req, res) => {
  res.send("Auth Working");
});

export default router;