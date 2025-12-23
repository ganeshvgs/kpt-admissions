import Application from "../models/application.model.js";

/**
 * Category bonus as per Karnataka norms (example)
 */
const categoryBonus = {
  GM: 0,
  "Cat-1": 2,
  "2A": 2,
  "2B": 2,
  "3A": 2,
  "3B": 2,
  SC: 5,
  ST: 5,
};

export const generateMeritList = async (req, res) => {
  try {
    // 1️⃣ Fetch VERIFIED applications only
    const applications = await Application.find({
      status: "VERIFIED",
    });

    if (!applications.length) {
      return res
        .status(400)
        .json({ message: "No verified applications found" });
    }

    // 2️⃣ Calculate merit score
    const scored = applications.map((app) => {
      const percentage = app.academicDetails?.sslcPercentage || 0;
      const category = app.categoryDetails?.category || "GM";
      const bonus = categoryBonus[category] || 0;

      return {
        app,
        meritScore: percentage + bonus,
      };
    });

    // 3️⃣ Sort by merit (DESC)
    scored.sort((a, b) => b.meritScore - a.meritScore);

    // 4️⃣ Assign rank and update DB
    for (let i = 0; i < scored.length; i++) {
      const application = scored[i].app;
      application.rank = i + 1;
      application.meritScore = scored[i].meritScore;
      application.status = "MERIT_GENERATED";
      await application.save();
    }

    res.json({
      success: true,
      message: "Merit list generated successfully",
      totalStudents: scored.length,
    });
  } catch (err) {
    console.error("❌ Merit generation failed:", err);
    res.status(500).json({
      message: err.message || "Merit generation failed",
    });
  }
};
export const getMeritList = async (req, res) => {
  try {
    const list = await Application.find({
      status: "MERIT_GENERATED",
    }).sort({ rank: 1 });

    res.json({ meritList: list });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch merit list" });
  }
};
