import Application from "../models/application.model.js";
import Seat from "../models/seat.model.js";

export const allocateSeats = async (req, res) => {
  try {
    const round = Number(req.body.round || 1);

    // fetch merit generated students
    const applications = await Application.find({
      status: "MERIT_GENERATED",
    }).sort({ rank: 1 });

    if (applications.length === 0) {
      return res.status(400).json({
        message: "No applications available for allocation",
      });
    }

    // fetch seat availability
    const seats = await Seat.find();
    const seatMap = {};
    seats.forEach((s) => {
      seatMap[s.branch] = s;
    });

    let allocatedCount = 0;

    for (const app of applications) {
      for (const branch of app.branchPreferences) {
        const seat = seatMap[branch];

        if (seat && seat.availableSeats > 0) {
          // allocate seat
          app.allottedBranch = branch;
          app.status = "SEAT_ALLOTTED";
          app.round = round;

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
      message: `Seat allocation completed for round ${round}`,
      allocated: allocatedCount,
    });
  } catch (err) {
    console.error("❌ Seat allocation failed:", err);
    res.status(500).json({ message: "Seat allocation failed" });
  }
};
export const allocateNextRound = async (req, res) => {
  try {
    const round = Number(req.body.round);

    const candidates = await Application.find({
      $or: [
        { status: "MERIT_GENERATED" },
        { studentResponse: "UPGRADE_REQUESTED" },
      ],
    }).sort({ rank: 1 });

    const seats = await Seat.find();
    const seatMap = {};
    seats.forEach((s) => (seatMap[s.branch] = s));

    let allocated = 0;

    for (const app of candidates) {
      // skip locked seats
      if (app.seatLocked) continue;

      const startIndex = app.previousAllottedBranch
        ? app.branchPreferences.indexOf(app.previousAllottedBranch) + 1
        : 0;

      for (
        let i = startIndex;
        i < app.branchPreferences.length;
        i++
      ) {
        const branch = app.branchPreferences[i];
        const seat = seatMap[branch];

        if (seat && seat.availableSeats > 0) {
          app.previousAllottedBranch = app.allottedBranch;
          app.allottedBranch = branch;
          app.round = round;
          app.status = "SEAT_ALLOTTED";
          app.studentResponse = "PENDING";

          seat.availableSeats -= 1;

          await seat.save();
          await app.save();
          allocated++;
          break;
        }
      }
    }

    res.json({
      success: true,
      message: `Round ${round} allocation completed`,
      allocated,
    });
  } catch (err) {
    console.error("❌ Multi-round allocation failed:", err);
    res.status(500).json({ message: "Round allocation failed" });
  }
};
