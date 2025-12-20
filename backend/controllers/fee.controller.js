import Application from "../models/application.model.js";

export const getVerifiedStudents = async (req, res) => {
  try {
    const applications = await Application.find({
      status: "DOCUMENTS_VERIFIED",
    }).sort({ rank: 1 });

    res.json({ applications });
  } catch (err) {
    console.error("❌ Fetch verified students failed:", err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

export const recordFeePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, receiptNumber, paymentMode } = req.body;

    if (!amount || !receiptNumber || !paymentMode) {
      return res
        .status(400)
        .json({ message: "All payment fields required" });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.feePayment = {
      amount,
      receiptNumber,
      paymentMode,
      paidAt: new Date(),
      paidBy: req.userId,
    };

    application.status = "FEE_PAID";

    await application.save();

    res.json({
      success: true,
      message: "Fee payment recorded successfully",
    });
  } catch (err) {
    console.error("❌ Fee payment failed:", err);
    res.status(500).json({ message: "Payment failed" });
  }
};
