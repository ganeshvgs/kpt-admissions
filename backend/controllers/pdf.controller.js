//backend/controllers/pdf.controller.js
import PDFDocument from "pdfkit";
import axios from "axios";
import Application from "../models/application.model.js";

// Helper to fetch image buffer from URL
async function fetchImageBuffer(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return response.data;
  } catch (error) {
    return null; // Return null if image fails to load
  }
}

export const downloadAdmissionPDF = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // 1. Fetch Application Data
    const app = await Application.findOne({
      studentClerkId: userId,
      status: "ADMITTED", // Ensure only admitted students get this
    });

    if (!app) {
      return res.status(404).json({ message: "Admission record not found." });
    }

    // 2. Setup PDF Stream
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=KPT_Admission_${app.studentClerkId}.pdf`
    );

    doc.pipe(res);

    // ================= STYLING VARIABLES =================
    const primaryColor = "#047857"; // Emerald Green (Govt style)
    const secondaryColor = "#1e293b"; // Slate 800
    const lightGray = "#f1f5f9";
    const startX = 40;
    const width = 515; // A4 width minus margins

    // ================= 1. PAGE BORDER =================
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .strokeColor(primaryColor)
      .lineWidth(2)
      .stroke();

    // ================= 2. HEADER =================
    // Optional: Add College Logo here if you have a local path
    // doc.image('path/to/logo.png', 50, 45, { width: 50 });

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor(primaryColor)
      .text("GOVERNMENT POLYTECHNIC", 0, 50, { align: "center" });

    doc
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Department of Technical Education, Karnataka", { align: "center" });
    
    doc.text("Mangalore - 575004", { align: "center" });

    doc.moveDown(1.5);

    // Title Box
    doc
      .rect(startX, doc.y, width, 25)
      .fill(primaryColor);
    
    doc
      .fillColor("white")
      .fontSize(12)
      .text("PROVISIONAL ADMISSION ORDER (2025-2026)", startX, doc.y - 18, {
        align: "center",
        width: width,
      });

    doc.moveDown(2);

    // ================= 3. STUDENT PHOTO & BASIC INFO =================
    const currentY = doc.y;

    // -- Left Side: Basic Info --
    doc.fillColor("black").fontSize(10);
    doc.text(`Application No: `, startX, currentY);
    doc.font("Helvetica-Bold").text(app._id.toString().toUpperCase().slice(-8), startX + 90, currentY);
    
    doc.font("Helvetica").text(`Admission Date: `, startX, currentY + 15);
    doc.font("Helvetica-Bold").text(new Date().toLocaleDateString("en-IN"), startX + 90, currentY + 15);

    doc.font("Helvetica").text(`Merit Rank: `, startX, currentY + 30);
    doc.font("Helvetica-Bold").text(app.rank || "N/A", startX + 90, currentY + 30);

    // -- Right Side: Photo --
    // We try to fetch the photo from the URL stored in DB
    if (app.personalDetails.photo) {
      const imgBuffer = await fetchImageBuffer(app.personalDetails.photo);
      if (imgBuffer) {
        doc.image(imgBuffer, 450, currentY - 10, {
          fit: [80, 100],
          align: "right",
        });
        doc.rect(450, currentY - 10, 80, 100).strokeColor("black").stroke();
      } else {
        // Fallback placeholder box
        doc.rect(450, currentY - 10, 80, 100).strokeColor("gray").stroke();
        doc.text("Photo Error", 465, currentY + 30);
      }
    }

    doc.moveDown(6);

    // ================= 4. DETAILS TABLES =================

    // Helper to draw a row
    const drawRow = (label, value, y, isShaded = false) => {
      if (isShaded) {
        doc.rect(startX, y - 5, width, 20).fill(lightGray);
      }
      doc.fillColor("black").font("Helvetica-Bold").fontSize(10).text(label, startX + 10, y);
      doc.font("Helvetica").text(value || "-", startX + 200, y);
    };

    // --- A. Personal Details ---
    doc.font("Helvetica-Bold").fontSize(12).fillColor(primaryColor).text("I. CANDIDATE DETAILS", startX, doc.y);
    doc.moveDown(0.5);
    
    let yPos = doc.y;
    doc.moveTo(startX, yPos).lineTo(startX + width, yPos).strokeColor(primaryColor).stroke(); // Line above
    
    yPos += 10;
    drawRow("Candidate Name", app.personalDetails.name, yPos, true);
    yPos += 20;
    drawRow("Father's Name", app.personalDetails.fatherName, yPos);
    yPos += 20;
    drawRow("Date of Birth", app.personalDetails.dob, yPos, true);
    yPos += 20;
    drawRow("Gender", app.personalDetails.gender, yPos);
    yPos += 20;
    drawRow("Category Claimed", app.categoryDetails.category, yPos, true);
    yPos += 20;
    drawRow("Mobile Number", app.personalDetails.mobile, yPos);
    
    doc.moveDown(2);

    // --- B. Allotment Details ---
    doc.font("Helvetica-Bold").fontSize(12).fillColor(primaryColor).text("II. SEAT ALLOTMENT DETAILS", startX, doc.y + 20);
    doc.moveDown(0.5);
    
    yPos = doc.y + 10;
    doc.moveTo(startX, yPos - 10).lineTo(startX + width, yPos - 10).stroke(); // Line above

    drawRow("Allotted Branch Code", app.allottedBranch, yPos, true);
    yPos += 20;
    drawRow("Institute Name", "Govt Polytechnic, Mangalore", yPos);
    yPos += 20;
    drawRow("Admission Quota", "Karnataka State Quota", yPos, true);
    yPos += 20;
    drawRow("Fees Paid Status", "Paid / Verified", yPos);

    doc.moveDown(4);

    // ================= 5. DECLARATION & SIGNATURES =================
    
    doc.font("Helvetica").fontSize(10).fillColor("black");
    doc.text(
      "I hereby declare that the information provided is true to the best of my knowledge. I agree to abide by the rules and regulations of the institution.",
      startX,
      doc.y,
      { align: "justify", width: width }
    );

    doc.moveDown(4);

    const sigY = doc.y;

    // Student Signature Placeholder
    doc.text("__________________________", startX, sigY);
    doc.font("Helvetica-Bold").text("Signature of Student", startX + 20, sigY + 15);

    // Principal Signature Placeholder
    doc.text("__________________________", startX + 300, sigY);
    doc.font("Helvetica-Bold").text("Principal / Admission Officer", startX + 310, sigY + 15);
    doc.font("Helvetica").fontSize(8).text("(Digitally Generated via EDMS)", startX + 320, sigY + 30);

    // ================= 6. FOOTER =================
    const bottomY = doc.page.height - 60;
    doc
      .fontSize(8)
      .fillColor("gray")
      .text(
        `Generated on ${new Date().toLocaleString()} | ID: ${app._id}`,
        startX,
        bottomY,
        { align: "center" }
      );
    
    doc.text("This document is computer generated and valid for admission reporting.", startX, bottomY + 12, { align: "center" });

    // Finalize PDF
    doc.end();

  } catch (err) {
    console.error("❌ PDF Generation Error:", err);
    res.status(500).json({ message: "Failed to generate admission PDF." });
  }
};

export const downloadAcknowledgementPDF = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const app = await Application.findOne({
      studentClerkId: userId,
    });

    if (!app) return res.status(404).json({ message: "Application not found" });

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Acknowledgement.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("APPLICATION ACKNOWLEDGEMENT", { align: "center" });
    doc.moveDown();

    doc.fontSize(11);

    doc.text(`Application ID : ${app._id.toString().slice(-8)}`);
    doc.text(`Name : ${app.personalDetails?.name || "-"}`);
    doc.text(`Mobile : ${app.personalDetails?.mobile || "-"}`);
    doc.text(`Admission Type : ${app.admissionType}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").text("Selected Branches:");
    doc.font("Helvetica");

    app.branchPreferences.forEach((b, i) => {
      doc.text(`${i + 1}. ${b}`);
    });

    doc.moveDown();

    doc.font("Helvetica-Bold").text("Uploaded Documents:");
    doc.font("Helvetica");

    const docs = app.documents || {};

    Object.entries(docs).forEach(([key, value]) => {
      doc.text(`${key} : ${value ? "✔ Uploaded" : "✖ Not Uploaded"}`);
    });

    doc.moveDown(2);

    doc.fontSize(9).text(
      "This is system generated acknowledgement. Status / merit / seat allotment not included.",
      { align: "center" }
    );

    doc.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "PDF failed" });
  }
};