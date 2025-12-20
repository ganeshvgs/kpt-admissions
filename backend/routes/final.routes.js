import express from "express";
import {
  getFeePaidApplications,
  approveAdmission,
} from "../controllers/final.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/pending",
  requireAuth,
  requireRole(["principal"]),
  getFeePaidApplications
);

router.post(
  "/approve/:id",
  requireAuth,
  requireRole([ "principal"]),
  approveAdmission
);

export default router;
