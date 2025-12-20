import express from "express";
import {
  getVerifiedStudents,
  recordFeePayment,
} from "../controllers/fee.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.js";


const router = express.Router();

router.get(
  "/verified",
  requireAuth,
  requireRole(["accounts"]),
  getVerifiedStudents
);

router.post(
  "/pay/:id",
  requireAuth,
  requireRole(["accounts"]),
  recordFeePayment
);

export default router;
