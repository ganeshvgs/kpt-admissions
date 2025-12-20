import express from "express";
import { generateMeritList } from "../controllers/merit.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

/**
 * Generate merit list (Principal only)
 */
router.post(
  "/generate",
  requireAuth,
  requireRole(["principal"]),
  generateMeritList
);

export default router;
