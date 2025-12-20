import Application from "../models/application.model.js";

export const createApplication = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    const existing = await Application.findOne({
      studentClerkId: clerkUserId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Application already submitted" });
    }

    const application = new Application({
      studentClerkId: clerkUserId,
      ...req.body,
      status: "SUBMITTED",
    });

    await application.save();

    res.status(201).json({ application });
  } catch (err) {
    res.status(500).json({ message: "Submission failed" });
  }
};

export const getMyApplication = async (req, res) => {
  const app = await Application.findOne({
    studentClerkId: req.auth.userId,
  });
  res.json({ application: app });
};

export const updateMyApplication = async (req, res) => {
  const app = await Application.findOne({
    studentClerkId: req.auth.userId,
  });

  if (!app)
    return res.status(404).json({ message: "Application not found" });

  if (app.status !== "CORRECTION_REQUIRED")
    return res.status(403).json({ message: "Edit not allowed" });

  Object.assign(app, req.body);
  app.status = "SUBMITTED";
  app.remarks = "";

  await app.save();
  res.json({ message: "Application updated" });
};
