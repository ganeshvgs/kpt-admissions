import express from "express";
import {
  allocateSeats,
  getSeatMatrix // 👈 Import this
} from "../controllers/seat.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Get Dashboard Data
router.get(
  "/matrix",
  requireAuth,
  requireRole(["verification_officer"]),
  getSeatMatrix
);

// Run Allocation
router.post(
  "/allocate",
  requireAuth,
  requireRole(["verification_officer"]),
  allocateSeats
);

export default router;