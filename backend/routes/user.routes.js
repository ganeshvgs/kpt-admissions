import express from "express";
import { syncUser } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/sync", requireAuth, syncUser);

export default router;
