import Application from "../models/application.model.js";

// ✅ UPDATED: Handles Status Filtering & Search
export const getApplications = async (req, res) => {
  try {
    const { status, search } = req.query;

    // 1. Build Query Object
    let query = {};

    // Filter by Status (Default to SUBMITTED if not sent, or handle 'ALL')
    if (status && status !== "ALL") {
      query.status = status;
    }

    // Search Logic (Name, SSLC Register No, or Mobile)
    if (search) {
      query.$or = [
        { "personalDetails.name": { $regex: search, $options: "i" } },
        { "personalDetails.mobile": { $regex: search, $options: "i" } },
        { "academicDetails.sslcRegisterNumber": { $regex: search, $options: "i" } },
        { studentClerkId: { $regex: search, $options: "i" } },
      ];
    }

    const applications = await Application.find(query).sort({ updatedAt: -1 });
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
    // Run all counting queries in parallel for speed
    const [
      totalApplications,
      pendingVerification,
      verified,
      rejected,
      correctionRequired,
      physicallyVerified,
      finalAdmitted
    ] = await Promise.all([
      Application.countDocuments({}), // Total
      Application.countDocuments({ status: "SUBMITTED" }), // Pending
      Application.countDocuments({ status: "VERIFIED" }), // Online Verified
      Application.countDocuments({ status: "REJECTED" }),
      Application.countDocuments({ status: "CORRECTION_REQUIRED" }),
      
      // Assuming 'status' changes or you have a separate flag for Physical Verification
      Application.countDocuments({ status: "DOCUMENTS_VERIFIED" }), 
      
      // If you track final admission in the Application model or a separate one
      Application.countDocuments({ status: "ADMITTED" }) 
    ]);

    res.status(200).json({
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