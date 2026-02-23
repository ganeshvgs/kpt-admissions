import express from "express";
import {
  downloadAdmissionPDF,
  downloadAcknowledgementPDF
} from "../controllers/pdf.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/admission",
  requireAuth,
  requireRole(["student"]),
  downloadAdmissionPDF
);

router.get(
  "/acknowledgement",
  requireAuth,
  requireRole(["student"]),
  downloadAcknowledgementPDF
);

export default router;