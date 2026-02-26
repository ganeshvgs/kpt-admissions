//backend\controllers\user.controller.js
import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const syncUser = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    const email = clerkUser.emailAddresses[0].emailAddress;

    let user = await User.findOne({
      $or: [{ clerkUserId }, { email }],
    });

    if (!user) {
      user = await User.create({
        clerkUserId,
        email,
        role: "student",
      });
    } else if (!user.clerkUserId) {
      user.clerkUserId = clerkUserId;
      await user.save();
    }

    res.json({
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("syncUser error:", err);
    res.status(500).json({ error: err.message });
  }
};
