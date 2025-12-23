import Application from "../models/application.model.js";
import Seat from "../models/seat.model.js";

/* =========================
   GET ALLOTTED SEAT
========================= */
export const getAllottedSeat = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

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
  } catch (err) {
    console.error("❌ Fetch seat failed:", err);
    res.status(500).json({ message: "Failed to fetch seat" });
  }
};

/* =========================
   RESPOND TO SEAT
========================= */
export const respondToSeat = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { response } = req.body;

    if (!["ACCEPTED", "REJECTED"].includes(response)) {
      return res.status(400).json({ message: "Invalid response" });
    }

    const app = await Application.findOne({
      studentClerkId: clerkId,
      status: "SEAT_ALLOTTED",
    });

    if (!app) {
      return res.status(404).json({ message: "No seat allotted" });
    }

    if (response === "ACCEPTED") {
      app.studentResponse = "ACCEPTED";
      app.seatLocked = true;
      app.status = "PHYSICAL_VERIFICATION_PENDING";
    }

    if (response === "REJECTED") {
      app.studentResponse = "REJECTED";
      app.status = "MERIT_GENERATED";
      app.seatLocked = false;

      const seat = await Seat.findOne({ branch: app.allottedBranch });
      if (seat) {
        seat.availableSeats += 1;
        await seat.save();
      }

      app.allottedBranch = null;
      app.round = null;
    }

    await app.save();

    res.json({
      success: true,
      message: `Seat ${response.toLowerCase()} successfully`,
    });
  } catch (err) {
    console.error("❌ Seat response error:", err);
    res.status(500).json({ message: "Seat response failed" });
  }
};
