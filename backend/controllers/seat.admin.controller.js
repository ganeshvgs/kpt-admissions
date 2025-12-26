import Seat from "../models/seat.model.js";

/* =========================================
   GET ALL SEATS
========================================= */
export const getAllSeats = async (req, res) => {
  try {
    const seats = await Seat.find().sort({ branch: 1 });
    res.json({ seats });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch seats" });
  }
};

/* =========================================
   CREATE / UPDATE SEATS (ADMIN)
========================================= */
export const upsertSeat = async (req, res) => {
  try {
    const { branch, totalSeats } = req.body;

    // 🔐 Validation
    if (!branch || totalSeats === undefined || totalSeats < 0) {
      return res.status(400).json({
        message: "Branch and valid totalSeats are required",
      });
    }

    let seat = await Seat.findOne({ branch });

    // 🆕 New Branch
    if (!seat) {
      seat = await Seat.create({
        branch,
        totalSeats,
        availableSeats: totalSeats,
      });
    } 
    // ♻️ Existing Branch
    else {
      const oldTotal = seat.totalSeats;
      const diff = totalSeats - oldTotal;

      seat.totalSeats = totalSeats;

      // Increase available seats ONLY if total increased
      if (diff > 0) {
        seat.availableSeats += diff;
      }

      // Safety clamps
      if (seat.availableSeats > seat.totalSeats) {
        seat.availableSeats = seat.totalSeats;
      }

      if (seat.availableSeats < 0) {
        seat.availableSeats = 0;
      }

      await seat.save();
    }

    res.json({
      success: true,
      seat,
    });

  } catch (error) {
    console.error("Seat update error:", error);
    res.status(500).json({
      message: "Failed to update seat data",
    });
  }
};
