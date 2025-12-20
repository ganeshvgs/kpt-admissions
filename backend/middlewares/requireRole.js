import User from "../models/User.js";

export const requireRole = (roles = []) => {
  return async (req, res, next) => {
    const user = await User.findOne({ clerkUserId: req.clerkUserId });

    if (!user) {
      return res.status(403).json({ error: "User not registered" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.user = user;
    next();
  };
};
