import Application from "../models/application.model.js";

export const getFeePaidApplications = async (req, res) => {
  try {
    const apps = await Application.find({
      status: "FEE_PAID",
    }).sort({ rank: 1 });

    res.json({ applications: apps });
  } catch (err) {
    console.error("❌ Fetch final approval list failed:", err);
    res.status(500).json({ message: "Failed to load applications" });
  }
};

export const approveAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { classSection } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // 🎓 Generate Register Number
    const year = new Date().getFullYear();
    const branchCode = application.allottedBranch.toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);

    const registerNumber = `${year}${branchCode}${random}`;

    application.finalAdmission = {
      registerNumber,
      classSection,
      approvedBy: req.userId,
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
