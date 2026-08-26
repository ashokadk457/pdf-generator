import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import { extractLaosReport } from "./extract-report.js";
import { createReportPdf } from "./pdf.js";
import { openApiSpec } from "./openapi.js";

const app = express();
const root = path.resolve(import.meta.dirname, "..");
const uploadDir = path.join(root, "uploads");
const outputDir = path.join(root, "output", "pdf");
fs.mkdirSync(uploadDir, { recursive: true }); fs.mkdirSync(outputDir, { recursive: true });
const upload = multer({ dest: uploadDir, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (_r, f, cb) => cb(null, f.mimetype === "text/plain" || f.originalname.toLowerCase().endsWith(".txt")) });
app.use(express.static(path.join(root, "public")));
app.get("/api-docs.json", (_req, res) => res.json(openApiSpec));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: "WannaTalk LAOS API" }));

app.post("/api/reports", upload.single("transcript"), async (req, res) => {
  const uploadedPath = req.file?.path;
  try {
    const metadata = {
      patientName: String(req.body.patientName || "").trim(), referenceNumber: String(req.body.referenceNumber || "").trim(),
      email: String(req.body.email || "").trim(), phone: String(req.body.phone || "").trim(), intakeType: String(req.body.intakeType || "").trim(),
      sessionDate: String(req.body.sessionDate || new Date().toISOString()).trim(), language: String(req.body.language || "").trim(),
      age: String(req.body.age || "").trim(), gender: String(req.body.gender || "").trim()
    };
    if (!metadata.patientName || !metadata.referenceNumber || !metadata.intakeType || (!metadata.email && !metadata.phone)) return res.status(400).json({ error: "Patient name, reference number, intake type, and email or phone are required." });
    if (!uploadedPath) return res.status(400).json({ error: "A .txt transcript is required." });
    const transcriptText = fs.readFileSync(uploadedPath, "utf8").trim(); if (!transcriptText) return res.status(400).json({ error: "The transcript is empty." });
    const includeFaithSection = String(process.env.INCLUDE_FAITH_SECTION).toLowerCase() === "true";
    const report = await extractLaosReport({ transcriptText, metadata, includeFaithSection });
    const safeRef = metadata.referenceNumber.replace(/[^a-z0-9_-]+/gi, "-");
    const outputPath = path.join(outputDir, `WannaTalk-${safeRef}-${crypto.randomUUID().slice(0, 8)}.pdf`);
    await createReportPdf({ metadata, report, logoPath: process.env.LOGO_PATH || "", outputPath, includeFaithSection });
    res.download(outputPath, `WannaTalk-${safeRef}.pdf`);
  } catch (error) { console.error(error); res.status(500).json({ error: "The report could not be generated.", details: error.message }); }
  finally { if (uploadedPath) fs.rmSync(uploadedPath, { force: true }); }
});
app.use((error, _req, res, _next) => res.status(error instanceof multer.MulterError ? 400 : 500).json({ error: error.message || "Unexpected server error" }));
app.listen(Number(process.env.PORT || 3000), () => console.log(`WannaTalk report generator: http://localhost:${process.env.PORT || 3000}`));
