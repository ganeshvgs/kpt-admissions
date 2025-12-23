import express from "express";
import {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser, // Import
} from "../controllers/admin.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Only admin can access these routes
router.get("/users", requireAuth, requireRole(["admin"]), getAllUsers);
router.post("/users", requireAuth, requireRole(["admin"]), createUser);
router.patch("/users/:userId/role", requireAuth, requireRole(["admin"]), updateUserRole);
router.delete("/users/:userId", requireAuth, requireRole(["admin"]), deleteUser); // New Route

export default router;