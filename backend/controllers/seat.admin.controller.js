// controllers/seat.admin.controller.js
import Seat from "../models/seat.model.js";

export const getAllSeats = async (req, res) => {
  const seats = await Seat.find().sort({ branch: 1 });
  res.json({ seats });
};

export const upsertSeat = async (req, res) => {
  const { branch, totalSeats } = req.body;

  let seat = await Seat.findOne({ branch });

  if (!seat) {
    seat = await Seat.create({
      branch,
      totalSeats,
      availableSeats: totalSeats,
    });
  } else {
    const diff = totalSeats - seat.totalSeats;
    seat.totalSeats = totalSeats;
    seat.availableSeats += diff;
    if (seat.availableSeats < 0) seat.availableSeats = 0;
    await seat.save();
  }

  res.json({ success: true, seat });
};
