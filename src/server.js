import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import multer from "multer";
import { extractReport } from "./extract-report.js";
import { createReportPdf } from "./pdf.js";

const app = express();
const root = path.resolve(import.meta.dirname, "..");
const uploadDir = path.join(root, "uploads");
const outputDir = path.join(root, "output", "pdf");
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype === "text/plain" || file.originalname.toLowerCase().endsWith(".txt"))
});

app.use(express.static(path.join(root, "public")));

app.post("/api/reports", upload.single("transcript"), async (req, res) => {
  const uploadedPath = req.file?.path;
  try {
    const metadata = {
      patientName: String(req.body.patientName || "").trim(),
      referenceNumber: String(req.body.referenceNumber || "").trim(),
      email: String(req.body.email || "").trim(),
      phone: String(req.body.phone || "").trim(),
      intakeType: String(req.body.intakeType || "").trim()
    };
    if (!metadata.patientName || !metadata.referenceNumber || !metadata.intakeType || (!metadata.email && !metadata.phone)) {
      return res.status(400).json({ error: "Patient name, reference number, intake type, and email or phone are required." });
    }
    if (!uploadedPath) return res.status(400).json({ error: "A .txt transcript is required." });
    const transcript = fs.readFileSync(uploadedPath, "utf8").trim();
    if (!transcript) return res.status(400).json({ error: "The transcript file is empty." });

    const report = await extractReport(transcript);
    const safeRef = metadata.referenceNumber.replace(/[^a-z0-9_-]+/gi, "-");
    const filename = `WannaTalk-${safeRef}-${crypto.randomUUID().slice(0, 8)}.pdf`;
    const outputPath = path.join(outputDir, filename);
    await createReportPdf({ metadata, report, logoPath: process.env.LOGO_PATH || "", outputPath });
    res.download(outputPath, `WannaTalk-${safeRef}.pdf`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "The report could not be generated.", details: error.message });
  } finally {
    if (uploadedPath) fs.rmSync(uploadedPath, { force: true });
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) return res.status(400).json({ error: error.message });
  res.status(500).json({ error: "Unexpected server error." });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`WannaTalk report generator: http://localhost:${port}`));
