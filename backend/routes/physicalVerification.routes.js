import express from "express";
import {
  getAcceptedStudents,
  verifyPhysicalDocuments,
} from "../controllers/physicalVerification.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
const router = express.Router();

// List students who accepted seat
router.get(
  "/accepted",
  requireAuth,
  requireRole(["verification_officer"]),
  getAcceptedStudents
);

// Verify physical documents
router.patch(
  "/verify/:id",
  requireAuth,
  requireRole(["verification_officer"]),
  verifyPhysicalDocuments
);

export default router;
