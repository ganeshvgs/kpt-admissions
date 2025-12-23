import express from "express";
import { downloadAdmissionPDF } from "../controllers/pdf.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/admission",
  requireAuth,
  requireRole(["student"]),
  downloadAdmissionPDF
);

export default router;
