import Application from "../models/application.model.js";

/* =========================================
   1. GET LIST
   ========================================= */
export const getVerificationList = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // Default: Show only students who have accepted the seat
    let query = { seatLocked: true };

    // Status Mapping based on Frontend Tabs
    if (status === "PENDING") {
      query.status = "PHYSICAL_VERIFICATION_PENDING";
    } else if (status === "VERIFIED") {
      // ✅ Shows students who passed physical verification but are waiting for final approval
      query.status = "DOCUMENTS_VERIFIED";
    } else if (status === "FAILED") {
      query.status = "DOCUMENTS_FAILED";
    }

    // Search Logic
    if (search) {
      query.$or = [
        { "personalDetails.name": { $regex: search, $options: "i" } },
        { "personalDetails.mobile": { $regex: search, $options: "i" } },
        { "personalDetails.aadharNumber": { $regex: search, $options: "i" } },
      ];
    }

    const applications = await Application.find(query).sort({ updatedAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch list" });
  }
};

/* =========================================
   2. VERIFY ACTION (Intermediate Step)
   ========================================= */
export const verifyDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, remarks } = req.body;

    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ message: "Not found" });

    // Update the sub-document
    app.physicalVerification = {
      verified,
      verifiedBy: req.auth.userId,
      verifiedAt: new Date(),
      remarks: remarks || "",
    };

    // Update Status
    if (verified) {
      // ✅ Moves to intermediate state (Waiting for Final Approval)
      app.status = "DOCUMENTS_VERIFIED"; 
    } else {
      app.status = "DOCUMENTS_FAILED";
    }

    await app.save();

    res.json({
      success: true,
      message: verified 
        ? "Documents Verified! Sent for Final Approval." 
        : "Verification Failed.",
    });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
};