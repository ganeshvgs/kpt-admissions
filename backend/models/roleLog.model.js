// backend/models/roleLog.model.js
import mongoose from "mongoose";

const roleLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
    },
    targetUserId: {
      type: String,
      required: true,
    },
    oldRole: {
      type: String,
    },
    newRole: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RoleLog", roleLogSchema);
