//Backend/models/application.model.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    studentClerkId: {
      type: String,
      required: true,
      unique: true,
    },

    personalDetails: {
      name: String,
      dob: String,
      phone: String,
      address: String,
    },

    academicDetails: {
      sslcRegisterNumber: String,
      sslcMarks: Number,
      percentage: Number,
    },

    categoryDetails: {
      category: {
        type: String,
        enum: ["GM", "SC", "ST", "OBC"],
        default: "GM",
      },
      reservation: [String],
    },

    branchPreferences: {
      type: [String],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "CORRECTION_REQUIRED",
        "VERIFIED",
        "REJECTED",
        "MERIT_GENERATED",
        "SEAT_ALLOTTED",
        "ADMITTED",
      ],
      default: "DRAFT",
    },

    remarks: String,
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
