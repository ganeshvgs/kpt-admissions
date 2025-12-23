// backend/controllers/seat.controller.js
import Application from "../models/application.model.js";
import Seat from "../models/seat.model.js";

export const allocateSeats = async (req, res) => {
  try {
    const round = Number(req.body.round || 1);

    const applications = await Application.find({
      status: "MERIT_GENERATED",
    }).sort({ rank: 1 });

    if (!applications.length) {
      return res.status(400).json({
        message: "No applications available for allocation",
      });
    }

    const seats = await Seat.find();
    const seatMap = {};
    seats.forEach((s) => (seatMap[s.branch] = s));

    let allocatedCount = 0;

    for (const app of applications) {
      for (const branch of app.branchPreferences) {
        const seat = seatMap[branch];

        if (seat && seat.availableSeats > 0) {
          app.allottedBranch = branch;
          app.status = "SEAT_ALLOTTED";
          app.round = round;

          // 🔥 IMPORTANT
          app.studentResponse = "PENDING";
          app.seatLocked = false;

          seat.availableSeats -= 1;

          await seat.save();
          await app.save();

          allocatedCount++;
          break;
        }
      }
    }

    res.json({
      success: true,
      message: `Seat allocation completed`,
      allocated: allocatedCount,
    });
  } catch (err) {
    console.error("❌ Seat allocation failed:", err);
    res.status(500).json({ message: "Seat allocation failed" });
  }
};
