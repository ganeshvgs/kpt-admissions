import Application from "../models/application.model.js";

export const getAcceptedStudents = async (req, res) => {
  try {
    const applications = await Application.find({
      status: "PHYSICAL_VERIFICATION_PENDING", // ✅ FIX
      studentResponse: "ACCEPTED",
      seatLocked: true,
    }).sort({ rank: 1 });

    res.json({ applications });
  } catch (err) {
    console.error("❌ Fetch accepted students failed:", err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

export const verifyPhysicalDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, remarks } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.physicalVerification = {
      verified,
      verifiedBy: req.auth.userId,
      verifiedAt: new Date(),
      remarks: remarks || "",
    };

    if (verified) {
      application.status = "DOCUMENTS_VERIFIED";
    } else {
      application.status = "DOCUMENTS_FAILED";
    }

    await application.save();

    res.json({
      success: true,
      message: verified
        ? "Documents verified successfully"
        : "Documents verification failed",
    });
  } catch (err) {
    console.error("❌ Physical verification failed:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};
