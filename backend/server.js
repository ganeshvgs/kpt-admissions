import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";

// Routes
import meritRoutes from "./routes/merit.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import seatRoutes from "./routes/seat.routes.js";
import studentSeatRoutes from "./routes/student-seat.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import finalRoutes from "./routes/final.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import adminSeatRoutes from "./routes/admin.seat.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";
import adminAdmissionRoutes from "./routes/admin.admission.routes.js";
import physicalVerificationRoutes from "./routes/physicalVerification.routes.js";

dotenv.config();

const app = express();

// =============================
// 🔥 CONNECT DATABASE
// =============================
connectDB();

// =============================
// 🔥 GLOBAL MIDDLEWARES
// =============================

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
}));
// Body Parser
app.use(express.json());

// 🔥 VERY IMPORTANT → Clerk middleware MUST come before routes
app.use(clerkMiddleware());

// =============================
// 🔥 ROUTES
// =============================
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/student", studentSeatRoutes);
app.use("/api/admin/seats", adminSeatRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/physical-verification", physicalVerificationRoutes);
app.use("/api/final", finalRoutes);
app.use("/api/merit", meritRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admission", adminAdmissionRoutes);

// Root Test Route
app.get("/", (req, res) => {
  res.send("🚀 KPT Admissions Backend Running");
});

// =============================
// 🔥 GLOBAL ERROR HANDLER
// =============================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

// =============================
// 🔥 START SERVER
// =============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});