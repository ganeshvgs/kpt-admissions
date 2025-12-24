import Application from "../models/application.model.js";

/* ================= GET LIST ================= */
export const getVerifiedApplications = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Default to pending approvals
    let query = { status: "DOCUMENTS_VERIFIED" };

    // View history of admitted students
    if (status === "ADMITTED") {
        query = { status: "ADMITTED" };
    }

    const applications = await Application.find(query).sort({ rank: 1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: "Failed to load applications" });
  }
};

/* ================= APPROVE ADMISSION ================= */
export const approveAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { classSection } = req.body;

    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ message: "Not found" });

    if (app.status !== "DOCUMENTS_VERIFIED") {
      return res.status(400).json({ message: "Student documents not verified yet" });
    }

    // 🎓 Generate Register Number (Example: 2025 + CSE + 001)
    const year = new Date().getFullYear();
    const branch = app.allottedBranch.toUpperCase();
    
    // Simple logic: Use last 3 digits of Clerk ID or Rank to ensure uniqueness easily
    // In production, you might want a sequential counter in DB
    const uniqueSuffix = app.rank.toString().padStart(3, '0'); 
    const registerNumber = `${year}${branch}${uniqueSuffix}`;

    // Update Application
    app.status = "ADMITTED"; // ✅ FINAL STATUS
    app.finalAdmission = {
      registerNumber,
      classSection: classSection || "A", // Default to A
      approvedBy: req.auth.userId,
      approvedAt: new Date(),
    };

    await app.save();

    res.json({
      success: true,
      message: `Admission Approved! Reg No: ${registerNumber}`,
      registerNumber,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approval failed" });
  }
};