import express from "express";
import {
  allocateSeats
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
  requireRole(["hod", "admin", "verification_officer"]),
  allocateSeats
);


export default router;
