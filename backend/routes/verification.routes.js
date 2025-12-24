import express from "express";
import {
  getApplications, // 👈 Changed from getSubmittedApplications
  verifyApplication,
} from "../controllers/verification.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// ✅ UPDATED Route
router.get(
  "/applications",
  requireAuth,
  requireRole(["verification_officer"]),
  getApplications
);

router.patch(
  "/applications/:id",
  requireAuth,
  requireRole(["verification_officer"]),
  verifyApplication
);

export default router;