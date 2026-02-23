import Application from "../models/application.model.js";

/* =====================================================
 CREATE OR SUBMIT APPLICATION
===================================================== */

export const createApplication = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;
    const year = req.body.admissionYear || "2025-26";

    // Check if application already exists for this year
    let application = await Application.findOne({
      studentClerkId: clerkUserId,
      admissionYear: year,
    });

    // Block re-submit after final submit
    if (application && application.status === "VERIFIED") {
      return res.status(400).json({ message: "Application already submitted" });
    }

    const {
      admissionType,
      personalDetails,
      academicDetails,
      categoryDetails,
      branchPreferences,
      documents,
    } = req.body;

    /* -------------------------
       SANITIZE NUMBERS
    ------------------------- */

    const sanitizedAcademicDetails = {
      ...academicDetails,
      sslcMaxMarks: Number(academicDetails.sslcMaxMarks),
      sslcObtainedMarks: Number(academicDetails.sslcObtainedMarks),
      itiPucMaxMarks: Number(academicDetails.itiPucMaxMarks),
      itiPucObtainedMarks: Number(academicDetails.itiPucObtainedMarks),
    };

    const sanitizedCategoryDetails = {
      ...categoryDetails,
      annualIncome: Number(categoryDetails.annualIncome),
    };

    const updateData = {
      admissionType,
      personalDetails,
      academicDetails: sanitizedAcademicDetails,
      categoryDetails: sanitizedCategoryDetails,
      branchPreferences,
      documents,
      status: "SUBMITTED",
      studentClerkId: clerkUserId,
      admissionYear: year,
    };

    if (application) {
      // Update existing application
      application.set(updateData);
      await application.save();
      return res.status(200).json({ message: "Application Updated", application });
    } else {
      // Create new application
      application = new Application(updateData);
      await application.save();
      return res.status(201).json({ message: "Application Created", application });
    }

  } catch (err) {
    console.error("❌ Submission Error:", err);
    res.status(500).json({ message: err.message || "Submission failed" });
  }
};

/* =====================================================
 GET MY APPLICATION
===================================================== */

export const getMyApplication = async (req, res) => {
  try {
    const year = req.query.year || "2025-26";

    const app = await Application.findOne({
      studentClerkId: req.clerkUserId,
      admissionYear: year
    });

    res.json({ application: app });
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch application" });
  }
};

/* =====================================================
 UPDATE AFTER CORRECTION REQUIRED
===================================================== */

export const updateMyApplication = async (req, res) => {
  try {
    const app = await Application.findOne({
      studentClerkId: req.clerkUserId,
    });

    if (!app)
      return res.status(404).json({ message: "Application not found" });

    // SAFER STATUS CHECK
if (!["CORRECTION_REQUIRED","DRAFT"].includes(app.status)) {
  return res.status(403).json({ message: "Edit not allowed" });
}
    const {
      admissionType,
      admissionYear,
      personalDetails,
      academicDetails,
      categoryDetails,
      branchPreferences,
      documents
    } = req.body;

    const sanitizedAcademicDetails = {
      ...academicDetails,
      sslcMaxMarks: Number(academicDetails.sslcMaxMarks),
      sslcObtainedMarks: Number(academicDetails.sslcObtainedMarks),
      itiPucMaxMarks: Number(academicDetails.itiPucMaxMarks),
      itiPucObtainedMarks: Number(academicDetails.itiPucObtainedMarks),
    };

    const sanitizedCategoryDetails = {
      ...categoryDetails,
      annualIncome: Number(categoryDetails.annualIncome),
    };

    app.personalDetails = personalDetails;
    app.academicDetails = sanitizedAcademicDetails;
    app.categoryDetails = sanitizedCategoryDetails;
    app.branchPreferences = branchPreferences;
    app.documents = documents;

    // IMPORTANT
    app.admissionType = admissionType;
    app.admissionYear = admissionYear || app.admissionYear;

    // RESET STATUS
    app.status = "SUBMITTED";
    app.remarks = "";

    await app.save();

    res.json({ message: "Application updated successfully" });

  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ message: err.message || "Update failed" });
  }
};