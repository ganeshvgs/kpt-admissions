import express from "express";
import {
  getAllottedSeat,
  respondToSeat,
} from "../controllers/studentSeat.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// View seat allotment
router.get(
  "/seat",
  requireAuth,
  requireRole(["student"]),
  getAllottedSeat
);

// Accept / Reject / Upgrade
router.post(
  "/seat/respond",
  requireAuth,
  requireRole(["student"]),
  respondToSeat
);

export default router;
