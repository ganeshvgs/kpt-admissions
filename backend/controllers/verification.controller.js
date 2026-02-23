import Application from "../models/application.model.js";
import AdmissionSettings from "../models/AdmissionSettings.js";

// ✅ UPDATED: Handles Status Filtering & Search
export const getApplications = async (req, res) => {
  try {
    const { status, search } = req.query;

    // ⭐ GET ACTIVE ADMISSION TYPE
    const settings = await AdmissionSettings.findOne();

    let admissionType = null;

    if (settings?.normalActive) admissionType = "NORMAL";
    if (settings?.lateralActive) admissionType = "LATERAL";

    // If nothing active, return empty
    if (!admissionType) {
      return res.json({ applications: [] });
    }

    // BASE QUERY
    let query = {
      admissionType // 🔥 THIS IS THE MAGIC
    };

    // Status filter
    if (status && status !== "ALL") {
      query.status = status;
    }

    // Search
    if (search) {
      query.$or = [
        { "personalDetails.name": { $regex: search, $options: "i" } },
        { "personalDetails.mobile": { $regex: search, $options: "i" } },
        { "academicDetails.sslcRegisterNumber": { $regex: search, $options: "i" } },
        { studentClerkId: { $regex: search, $options: "i" } },
      ];
    }

    const applications = await Application
      .find(query)
      .sort({ updatedAt: -1 });

    res.json({ applications });

  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ KEEP: This remains the same
export const verifyApplication = async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (!["VERIFIED", "REJECTED", "CORRECTION_REQUIRED", "SUBMITTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const app = await Application.findById(id);
  if (!app) return res.status(404).json({ message: "Not found" });

  // Allow re-verification or status change for flexibility
  app.status = status;
  app.remarks = remarks || "";
  
  // If verifying, you might want to mark physicalVerification as pending
  if(status === "VERIFIED") {
      app.physicalVerification.verified = null; 
  }

  await app.save();
  res.json({ message: `Application updated to ${status}` });
};

export const getOfficerStats = async (req, res) => {
  try {
    const settings = await AdmissionSettings.findOne();

    let admissionType = null;

    if (settings?.normalActive) admissionType = "NORMAL";
    if (settings?.lateralActive) admissionType = "LATERAL";

    if (!admissionType) {
      return res.json({});
    }

    const base = { admissionType };

    const [
      totalApplications,
      pendingVerification,
      verified,
      rejected,
      correctionRequired,
      physicallyVerified,
      finalAdmitted
    ] = await Promise.all([
      Application.countDocuments(base),
      Application.countDocuments({ ...base, status: "SUBMITTED" }),
      Application.countDocuments({ ...base, status: "VERIFIED" }),
      Application.countDocuments({ ...base, status: "REJECTED" }),
      Application.countDocuments({ ...base, status: "CORRECTION_REQUIRED" }),
      Application.countDocuments({ ...base, status: "DOCUMENTS_VERIFIED" }),
      Application.countDocuments({ ...base, status: "ADMITTED" })
    ]);

    res.json({
      totalApplications,
      pendingVerification,
      verified,
      rejected,
      correctionRequired,
      physicallyVerified,
      finalAdmitted
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
};