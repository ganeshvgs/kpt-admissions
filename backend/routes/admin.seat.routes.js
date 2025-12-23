import express from "express";
import {
  getAllSeats,
  upsertSeat,
} from "../controllers/seat.admin.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

/* ===============================
   ADMIN – MANAGE SEATS ONLY
================================ */

// View all department seats
router.get(
  "/",
  requireAuth,
  requireRole(["admin"]),
  getAllSeats
);

// Create / Update seat count
router.post(
  "/",
  requireAuth,
  requireRole(["admin"]),
  upsertSeat
);

export default router;
