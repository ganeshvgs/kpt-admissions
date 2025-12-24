import express from "express";
import {
  getVerificationList,
  verifyDocuments,
} from "../controllers/physicalVerification.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Get Students (accepts ?status=PENDING&search=...)
router.get(
  "/list",
  requireAuth,
  requireRole(["verification_officer"]),
  getVerificationList
);

// Verify Action
router.patch(
  "/verify/:id",
  requireAuth,
  requireRole(["verification_officer"]),
  verifyDocuments
);

export default router;