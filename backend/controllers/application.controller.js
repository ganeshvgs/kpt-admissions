import Application from "../models/application.model.js";

export const createApplication = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    // 1. Check if application exists
    let application = await Application.findOne({ studentClerkId: clerkUserId });

    // 2. Prevent editing if already submitted (optional logic based on your needs)
    if (application && application.status === "SUBMITTED") {
      // Allow updates only if you want them to overwrite, otherwise block:
      // return res.status(400).json({ message: "Already submitted" });
    }

    // 3. Prepare Data (Sanitize if needed, or just use req.body)
    const updateData = {
      ...req.body,
      status: "SUBMITTED",
      studentClerkId: clerkUserId // Ensure ID is never overwritten
    };

    if (application) {
      // Update existing
      application.set(updateData); // .set() is safer than Object.assign for Mongoose
      await application.save();
      return res.status(200).json({ message: "Application Updated", application });
    } else {
      // Create new
      application = new Application(updateData);
      await application.save();
      return res.status(201).json({ message: "Application Created", application });
    }

  } catch (err) {
    // 🔥 THIS LOG IS CRITICAL FOR DEBUGGING
    console.error("❌ Submission Error:", err); 
    
    // Send the actual error message to the frontend so you can see it in the Toast
    res.status(500).json({ message: err.message || "Submission failed" });
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
