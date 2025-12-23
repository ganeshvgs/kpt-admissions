// backend/middlewares/auth.js
import { getAuth } from "@clerk/express";
import User from "../models/User.js";

/**
 * ===============================
 * REQUIRE AUTH (LOGIN REQUIRED)
 * ===============================
 * ✔ Verifies Clerk session
 * ✔ Attaches clerkUserId to request
 */
export const requireAuth = (req, res, next) => {
  try {
    const auth = getAuth(req);

    if (!auth || !auth.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.clerkUserId = auth.userId;
    next();
  } catch (err) {
    console.error("❌ Auth error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

/**
 * ===============================
 * REQUIRE ROLE (ROLE BASED ACCESS)
 * ===============================
 * ✔ Reads role from MongoDB (SOURCE OF TRUTH)
 * ✔ Blocks unauthorized roles
 *
 * Usage:
 * router.get("/admin", requireAuth, requireRole(["admin"]), handler)
 */
export const requireRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    const user = await User.findOne({ clerkUserId: req.clerkUserId });
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = user;
    next();
  };
};
