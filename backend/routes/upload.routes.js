import express from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { uploadSingleImage } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/image",
  requireAuth,
  requireRole(["student"]),
  uploadSingleImage,
  (req, res) => {
    if (!req.file?.cloudinaryUrl) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    res.json({ url: req.file.cloudinaryUrl });
  }
);

export default router;
