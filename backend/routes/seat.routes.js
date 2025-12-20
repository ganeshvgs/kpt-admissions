import express from "express";
import {
  allocateSeats,
  allocateNextRound,
} from "../controllers/seat.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

/**
 * Seat allocation (Round 1)
 * Allowed: HOD, Admin
 */
router.post(
  "/allocate",
  requireAuth,
  requireRole(["hod", "admin"]),
  allocateSeats
);

/**
 * Seat allocation (Next rounds)
 * Allowed: HOD, Admin
 */
router.post(
  "/allocate/round",
  requireAuth,
  requireRole(["hod", "admin"]),
  allocateNextRound
);

export default router;
