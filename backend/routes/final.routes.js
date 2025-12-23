import express from "express";
import {
  getVerifiedApplications,
  approveAdmission,
} from "../controllers/final.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Applications ready for final approval
router.get(
  "/pending",
  requireAuth,
  requireRole(["verification_officer"]),
  getVerifiedApplications
);

// Final admission approval
router.post(
  "/approve/:id",
  requireAuth,
  requireRole(["verification_officer"]),
  approveAdmission
);

export default router;
