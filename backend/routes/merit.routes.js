import express from "express";
import {
  generateMeritList,
  getMeritList,
} from "../controllers/merit.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// generate merit
router.post(
  "/generate",
  requireAuth,
  requireRole(["verification_officer"]),
  generateMeritList
);

// 🔥 view merit list
router.get(
  "/list",
  requireAuth,
  requireRole(["verification_officer"]),
  getMeritList
);

export default router;
