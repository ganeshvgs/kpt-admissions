import Application from "../models/application.model.js";

export const getSubmittedApplications = async (req, res) => {
  const applications = await Application.find({
    status: "SUBMITTED",
  });
  res.json({ applications });
};

export const verifyApplication = async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (!["VERIFIED", "REJECTED", "CORRECTION_REQUIRED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const app = await Application.findById(id);
  if (!app) return res.status(404).json({ message: "Not found" });

  if (app.status !== "SUBMITTED")
    return res.status(400).json({ message: "Already processed" });

  app.status = status;
  app.remarks = remarks || "";

  await app.save();
  res.json({ message: "Updated" });
};
