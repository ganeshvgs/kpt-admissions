import Application from "../models/application.model.js";

const categoryBonus = {
  GM: 0,
  OBC: 2,
  SC: 5,
  ST: 5,
};

export const generateMeritList = async (req, res) => {
  try {
    // fetch only verified applications
    const applications = await Application.find({
      status: "VERIFIED",
    });

    if (applications.length === 0) {
      return res
        .status(400)
        .json({ message: "No verified applications found" });
    }

    // calculate merit score
    const scored = applications.map((app) => {
      const bonus =
        categoryBonus[app.categoryDetails.category] || 0;

      const meritScore =
        app.academicDetails.percentage + bonus;

      return {
        app,
        meritScore,
      };
    });

    // sort descending by merit
    scored.sort((a, b) => b.meritScore - a.meritScore);

    // assign rank
    for (let i = 0; i < scored.length; i++) {
      scored[i].app.rank = i + 1;
      scored[i].app.status = "MERIT_GENERATED";
      await scored[i].app.save();
    }

    res.json({
      success: true,
      message: "Merit list generated successfully",
      total: scored.length,
    });
  } catch (err) {
    console.error("❌ Merit generation failed:", err);
    res.status(500).json({ message: "Merit generation failed" });
  }
};
