import express from "express";
import {
  getAllUsers,
  createUser,
  updateUserRole,
} from "../controllers/admin.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.js";


const router = express.Router();

router.get(
  "/users",
  requireAuth,
  requireRole(["admin"]),
  getAllUsers
);

router.post(
  "/users",
  requireAuth,
  requireRole(["admin"]),
  createUser
);

router.patch(
  "/users/:userId/role",
  requireAuth,
  requireRole(["admin"]),
  updateUserRole
);

export default router;
