import express from "express";
import {
  createApplication,
  getMyApplication,
  updateMyApplication,
} from "../controllers/application.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireRole(["student"]), createApplication);
router.get("/my", requireAuth, requireRole(["student"]), getMyApplication);
router.put("/", requireAuth, requireRole(["student"]), updateMyApplication);

export default router;
