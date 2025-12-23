import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    /* =====================================================
       1. BASIC IDENTIFICATION
    ===================================================== */
    studentClerkId: {
      type: String,
      required: true,
      unique: true, // Ensures one active application per student
      index: true,
    },

    admissionType: {
      type: String,
      enum: ["NORMAL", "LATERAL"],
      default: "NORMAL",
      required: true,
    },

    /* =====================================================
       2. PERSONAL DETAILS
       (Updated with Aadhar, District, State)
    ===================================================== */
    personalDetails: {
      name: { type: String, trim: true, required: true },
      fatherName: { type: String, trim: true },
      motherName: { type: String, trim: true },
      dob: { type: String }, // Format: YYYY-MM-DD
      
      gender: {
        type: String,
        enum: ["Male", "Female", "Transgender", "Others", ""],
      },

      religion: { type: String }, // e.g., Hindu, Muslim, Christian...
      nationality: { type: String, default: "INDIAN" },
      
      // -- CONTACT --
      mobile: { type: String, required: true },
      email: { type: String },
      
      // -- ADDRESS --
      address: { type: String },
      district: { type: String, trim: true }, // ✅ NEW
      state: { type: String, default: "Karnataka" }, // ✅ NEW
      pincode: { type: String },

      // -- IDENTIFICATION --
      satsNumber: { type: String, trim: true },
      aadharNumber: { type: String, trim: true }, // ✅ NEW

      // -- MEDIA --
      photo: { type: String }, // Stores Cloudinary/S3 URL
    },

    /* =====================================================
       3. ACADEMIC DETAILS
    ===================================================== */
    academicDetails: {
      // --- SSLC (10th) ---
      board: { type: String, default: "SSLC" }, // SSLC, CBSE, ICSE, Other
      sslcRegisterNumber: { type: String, trim: true },
      sslcPassingYear: { type: String },
      
      // Marks stored as Numbers for calculations
      sslcMaxMarks: { type: Number },
      sslcObtainedMarks: { type: Number },
      sslcPercentage: { type: Number },
      
      // Specific subjects for Science stream logic
      scienceMarks: { type: Number },
      mathsMarks: { type: Number },

      // --- LATERAL ENTRY (ITI / PUC) ---
      qualifyingExam: {
        type: String,
        // ✅ Updated to match Frontend Dropdown values
        enum: ["ITI (2 Years)", "PUC (Science)", "", "ITI", "PUC"], 
      },
      itiPucRegisterNumber: { type: String, trim: true },
      itiPucPassingYear: { type: String },
      itiPucMaxMarks: { type: Number },
      itiPucObtainedMarks: { type: Number },
      itiPucPercentage: { type: Number },
    },

    /* =====================================================
       4. CATEGORY & RESERVATION
    ===================================================== */
    categoryDetails: {
      category: {
        type: String,
        enum: ["GM", "SC", "ST", "Cat-1", "2A", "2B", "3A", "3B"],
        default: "GM",
      },
      casteName: { type: String, trim: true },
      annualIncome: { type: Number }, // Stored as number for logic checks

      isRural: { type: Boolean, default: false },
      isKannadaMedium: { type: Boolean, default: false },
      isStudyCertificateExempt: { type: Boolean, default: false },
    },

    /* =====================================================
       5. BRANCH PREFERENCES
       Valid Codes: CE, ME, EEE, ECE, CSE, AE, ChE, Poly
    ===================================================== */
    branchPreferences: {
      type: [String], 
      default: [],
      // You can add a validator here if you want to strictly enforce codes
    },

    /* =====================================================
       6. MERIT, RANKING & ADMIN
    ===================================================== */
    meritScore: {
      type: Number,
      default: null,
      index: true, // For faster sorting by merit
    },

    rank: {
      type: Number,
      default: null,
    },

    /* =====================================================
       7. SEAT ALLOTMENT & STUDENT RESPONSE
    ===================================================== */
    allottedBranch: {
      type: String, // Stores the Branch Code (e.g., "CSE")
      default: null,
    },

    studentResponse: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "UPGRADE_REQUESTED"],
      default: "PENDING",
    },

    seatLocked: {
      type: Boolean,
      default: false, // True if student confirms admission or admin freezes seat
    },

    /* =====================================================
       8. PHYSICAL DOCUMENT VERIFICATION
    ===================================================== */
    physicalVerification: {
      verified: { type: Boolean, default: null }, // null = pending, true = verified, false = failed
      verifiedBy: { type: String }, // Admin ID/Name
      verifiedAt: { type: Date },
      remarks: { type: String },
    },

    /* =====================================================
       9. APPLICATION STATUS LIFECYCLE
    ===================================================== */
    status: {
      type: String,
      enum: [
        "DRAFT",                       // User is editing
        "SUBMITTED",                   // User submitted, waiting for verification
        "CORRECTION_REQUIRED",         // Admin requested changes
        "VERIFIED",                    // Online verification done
        "REJECTED",                    // Application invalid
        "MERIT_GENERATED",             // Merit list generated
        "SEAT_ALLOTTED",               // Algorithm allotted a seat
        "SEAT_ACCEPTED",               // User accepted the seat
        "PHYSICAL_VERIFICATION_PENDING", // User needs to come to college
        "DOCUMENTS_VERIFIED",          // Offline docs checked
        "DOCUMENTS_FAILED",            // Offline docs mismatch
        "ADMITTED"                     // Final Admission
      ],
      default: "DRAFT",
      index: true,
    },

    /* =====================================================
       10. ADMIN & SYSTEM REMARKS
    ===================================================== */
    remarks: {
      type: String, // Visible to student (e.g., "Please re-upload photo")
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("Application", applicationSchema);