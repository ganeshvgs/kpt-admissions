import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import meritRoutes from "./routes/merit.routes.js";
import { clerkMiddleware } from "@clerk/express";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import seatRoutes from "./routes/seat.routes.js";
import studentSeatRoutes from "./routes/student-seat.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import finalRoutes from "./routes/final.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import adminSeatRoutes from "./routes/admin.seat.routes.js"
import pdfRoutes from "./routes/pdf.routes.js";
import physicalVerificationRoutes from "./routes/physicalVerification.routes.js";
dotenv.config();


const app = express();

// DB
connectDB();

// Middlewares
app.use(cors());
app.use(clerkMiddleware()); // 🔥 REQUIRED
app.use(express.json());

// Routes
app.use("/api/verification", verificationRoutes);
app.use("/api/physical-verification", physicalVerificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/final", finalRoutes);
app.use("/api/merit", meritRoutes);
app.use("/api/student", studentSeatRoutes);
app.use("/api/admin/seats", adminSeatRoutes);
app.use("/api/seats", seatRoutes);
app.get("/", (req, res) => {
  res.send("KPT Admissions Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
