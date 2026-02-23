// backend/middlewares/auth.js
import { getAuth } from "@clerk/express";
import User from "../models/User.js";

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
