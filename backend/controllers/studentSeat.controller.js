import Application from "../models/application.model.js";
import Seat from "../models/seat.model.js";

export const getAllottedSeat = async (req, res) => {
  const clerkId = req.userId;

  const app = await Application.findOne({
    studentClerkId: clerkId,
    status: "SEAT_ALLOTTED",
  });

  if (!app) {
    return res.json({ seat: null });
  }

  res.json({
    seat: {
      branch: app.allottedBranch,
      round: app.round,
      status: app.studentResponse,
    },
  });
};

export const respondToSeat = async (req, res) => {
  try {
    const clerkId = req.userId;
    const { response } = req.body;

    if (!["ACCEPTED", "REJECTED", "UPGRADE_REQUESTED"].includes(response)) {
      return res.status(400).json({ message: "Invalid response" });
    }

    const app = await Application.findOne({
      studentClerkId: clerkId,
      status: "SEAT_ALLOTTED",
    });

    if (!app) {
      return res.status(404).json({ message: "No seat allotted" });
    }

    // ACCEPT
    if (response === "ACCEPTED") {
      app.studentResponse = "ACCEPTED";
      app.seatLocked = true;
    }

    // REJECT
    if (response === "REJECTED") {
      app.studentResponse = "REJECTED";
      app.status = "MERIT_GENERATED"; // eligible for next round
      app.allottedBranch = null;
      app.round = null;

      // return seat
      const seat = await Seat.findOne({ branch: app.allottedBranch });
      if (seat) {
        seat.availableSeats += 1;
        await seat.save();
      }
    }

    // UPGRADE
    if (response === "UPGRADE_REQUESTED") {
      app.studentResponse = "UPGRADE_REQUESTED";
      app.status = "MERIT_GENERATED"; // considered again
      app.seatLocked = false;
    }

    await app.save();

    res.json({
      success: true,
      message: `Seat ${response.toLowerCase()}`,
    });
  } catch (err) {
    console.error("❌ Seat response error:", err);
    res.status(500).json({ message: "Seat response failed" });
  }
};
