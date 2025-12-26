// models/seat.model.js
import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      enum: ["CSE", "AE", "ChE", "CE", "ECE", "EEE", "ME", "Poly"],
      required: true,
      unique: true,
      index: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 0,
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

/**
 * Ensure availableSeats never exceeds totalSeats
 */
seatSchema.pre("save", function (next) {
  if (this.availableSeats > this.totalSeats) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

export default mongoose.model("Seat", seatSchema);
