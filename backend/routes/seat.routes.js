//routes/seat.routes.js
import express from "express";
import {
  allocateSeats
} from "../controllers/seat.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/allocate",
  requireAuth,
  requireRole(["verification_officer"]),
  allocateSeats
);


export default router;
