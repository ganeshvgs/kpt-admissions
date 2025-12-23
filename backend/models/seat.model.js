//models/seat.model.js
import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      enum: ["CSE", "ECE", "ME", "CE", "EEE"],
      required: true,
      unique: true,
    },
    totalSeats: Number,
    availableSeats: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Seat", seatSchema);
