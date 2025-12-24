import Application from "../models/application.model.js";
import Seat from "../models/seat.model.js";

/* =========================================
   1. GET SEAT MATRIX (Dashboard Data)
   ========================================= */
export const getSeatMatrix = async (req, res) => {
  try {
    const seats = await Seat.find({});
    
    // Calculate totals
    const totalSeats = seats.reduce((acc, s) => acc + s.totalSeats, 0);
    const availableSeats = seats.reduce((acc, s) => acc + s.availableSeats, 0);
    const allocatedSeats = totalSeats - availableSeats;

    // Count eligible students (Status = MERIT_GENERATED)
    const eligibleStudents = await Application.countDocuments({ 
      status: "MERIT_GENERATED" 
    });

    res.json({
      seats, // Array of branch data
      stats: {
        totalSeats,
        availableSeats,
        allocatedSeats,
        eligibleStudents
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch seat matrix" });
  }
};

/* =========================================
   2. ALLOCATE SEATS (Algorithm)
   ========================================= */
export const allocateSeats = async (req, res) => {
  try {
    const round = Number(req.body.round || 1);

    // 1. Fetch Eligible Students (Sorted by Rank)
    // Only fetch students who have been ranked but not yet admitted
    const applications = await Application.find({
      status: "MERIT_GENERATED", 
    }).sort({ rank: 1 });

    if (!applications.length) {
      return res.status(400).json({
        message: "No eligible students found for allocation (Check if Merit is generated).",
      });
    }

    // 2. Fetch Current Seat Data
    const seats = await Seat.find();
    const seatMap = {};
    // Create a map for quick access: seatMap['CSE'] = seatObject
    seats.forEach((s) => (seatMap[s.branch] = s));

    let allocatedCount = 0;
    let studentsProcessed = 0;

    // 3. Allocation Loop
    for (const app of applications) {
      studentsProcessed++;
      
      // Check student's preferences in order
      for (const branchCode of app.branchPreferences) {
        const seat = seatMap[branchCode];

        // If seat exists and has space
        if (seat && seat.availableSeats > 0) {
          // -- ASSIGN SEAT --
          app.allottedBranch = branchCode;
          app.status = "SEAT_ALLOTTED";
          app.studentResponse = "PENDING"; // Reset response for new round
          app.seatLocked = false;
          
          // -- UPDATE SEAT COUNT --
          seat.availableSeats -= 1;
          
          await app.save();
          // We save seat later or now. Saving inside loop is safer for race conditions in simple apps.
          await seat.save(); 

          allocatedCount++;
          break; // Stop checking preferences for this student
        }
      }
    }

    res.json({
      success: true,
      message: `Round ${round} Allocation Complete`,
      details: {
        processed: studentsProcessed,
        allocated: allocatedCount,
        unallocated: studentsProcessed - allocatedCount
      }
    });

  } catch (err) {
    console.error("❌ Seat allocation failed:", err);
    res.status(500).json({ message: "Seat allocation algorithm failed." });
  }
};