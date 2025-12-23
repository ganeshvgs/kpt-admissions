import Application from "../models/application.model.js";

/* ================= GET VERIFIED APPLICATIONS ================= */
export const getVerifiedApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      status: "DOCUMENTS_VERIFIED",
    }).sort({ rank: 1 });

    res.json({ applications });
  } catch (err) {
    console.error("❌ Fetch verified applications failed:", err);
    res.status(500).json({ message: "Failed to load applications" });
  }
};

/* ================= FINAL ADMISSION APPROVAL ================= */
export const approveAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { classSection } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "DOCUMENTS_VERIFIED") {
      return res.status(400).json({
        message: "Documents must be verified before final approval",
      });
    }

    // 🎓 Generate Register Number
    const year = new Date().getFullYear();
    const branchCode = application.allottedBranch.toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);

    const registerNumber = `${year}${branchCode}${random}`;

    application.finalAdmission = {
      registerNumber,
      classSection,
      approvedBy: req.auth.userId,
      approvedAt: new Date(),
    };

    application.status = "ADMITTED";

    await application.save();

    res.json({
      success: true,
      message: "Admission approved successfully",
      registerNumber,
    });
  } catch (err) {
    console.error("❌ Final approval failed:", err);
    res.status(500).json({ message: "Approval failed" });
  }
};
