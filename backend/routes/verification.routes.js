import express from "express";
import {
  getSubmittedApplications,
  verifyApplication,
} from "../controllers/verification.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/applications",
  requireAuth,
  requireRole(["verification_officer"]),
  getSubmittedApplications
);

router.patch(
  "/applications/:id",
  requireAuth,
  requireRole(["verification_officer"]),
  verifyApplication
);

export default router;
