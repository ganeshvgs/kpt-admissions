import express from "express";
import AdmissionSettings from "../models/AdmissionSettings.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

/* =====================================================
   GET SETTINGS (PUBLIC – STUDENT CAN READ)
===================================================== */
router.get("/settings", async (req, res) => {
  let settings = await AdmissionSettings.findOne();
  if (!settings) {
    settings = await AdmissionSettings.create({});
  }
  res.json(settings);
});

/* =====================================================
   UPDATE SETTINGS (ADMIN ONLY)
===================================================== */
router.put(
  "/settings",
  requireAuth,
  requireRole(["admin"]),
  async (req, res) => {
    let { normalActive, lateralActive } = req.body;

    // 🔒 ENFORCE ONLY ONE ACTIVE
    if (normalActive === true) {
      lateralActive = false;
    }

    if (lateralActive === true) {
      normalActive = false;
    }

    const settings = await AdmissionSettings.findOneAndUpdate(
      {},
      { normalActive, lateralActive },
      { new: true, upsert: true }
    );

    res.json(settings);
  }
);


export default router;
