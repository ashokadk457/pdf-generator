import fs from "node:fs";
import PDFDocument from "pdfkit";

const NAVY = "#17384A";
const MUTED = "#708696";
const BORDER = "#BCD8E3";
const GREEN = "#19A64A";

function clean(value, fallback = "Not available") {
  const text = value == null ? "" : String(value).trim();
  return text || fallback;
}

function listText(items, fallback = "Not available from the transcript") {
  return Array.isArray(items) && items.length ? items.map((x) => clean(x)) : [fallback];
}

export function createReportPdf({ metadata, report, logoPath, outputPath }) {
  fs.mkdirSync(new URL("../output/pdf/", import.meta.url), { recursive: true });
  const doc = new PDFDocument({ size: "A4", margins: { top: 58, bottom: 0, left: 50, right: 50 }, bufferPages: true, info: { Title: `WannaTalk LAOS - ${metadata.referenceNumber}` } });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const pageWidth = doc.page.width;
  const left = 50;
  const contentWidth = pageWidth - 100;

  function header() {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(NAVY).text("WannaTalk | LAOS Intake Report", left, 25, { lineBreak: false });
    doc.moveTo(left, 39).lineTo(pageWidth - left, 39).lineWidth(1.5).strokeColor(NAVY).stroke();
  }
  function footer() {
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text("Talk it out. You are not alone.", left, doc.page.height - 30, { width: contentWidth, align: "center", lineBreak: false });
  }
  function newPage() { doc.addPage(); doc.y = 70; }
  function heading(number, title) {
    if (doc.y > doc.page.height - 110) newPage();
    doc.moveDown(0.35).font("Helvetica-Bold").fontSize(14).fillColor(NAVY).text(`${number}. ${title}`);
    doc.moveDown(0.35);
  }
  function box(text) {
    const normalized = clean(text);
    const height = Math.max(48, doc.heightOfString(normalized, { width: contentWidth - 24 }) + 24);
    if (doc.y + height > doc.page.height - 55) newPage();
    const y = doc.y;
    doc.roundedRect(left, y, contentWidth, height, 2).lineWidth(0.7).strokeColor(BORDER).stroke();
    doc.font("Helvetica").fontSize(9.5).fillColor("#263D49").text(normalized, left + 12, y + 12, { width: contentWidth - 24 });
    doc.y = y + height + 4;
  }
  function bullets(items, fallback) {
    for (const item of listText(items, fallback)) {
      if (doc.y > doc.page.height - 65) newPage();
      doc.font("Helvetica").fontSize(9.5).fillColor("#263D49").text(`- ${item}`, left, doc.y, { width: contentWidth, indent: 2 });
      doc.moveDown(0.25);
    }
  }

  if (logoPath && fs.existsSync(logoPath)) {
    try { doc.image(logoPath, pageWidth / 2 - 65, 72, { fit: [130, 60], align: "center" }); } catch { /* invalid logo is non-fatal */ }
  }
  doc.y = logoPath && fs.existsSync(logoPath) ? 142 : 82;
  doc.font("Helvetica-Bold").fontSize(22).fillColor(NAVY).text("WannaTalk", { align: "center" });
  doc.font("Helvetica").fontSize(11).fillColor(MUTED).text("Intake report for clinical review", { align: "center" });
  doc.moveDown(1);

  const rows = [
    ["Patient", metadata.patientName], ["Age", report.age], ["Gender", report.gender],
    ["Language", report.language ? `${report.language}${report.languageBasis === "inferred" ? " (inferred)" : ""}` : null],
    ["Intake type", metadata.intakeType], ["Reference", metadata.referenceNumber],
    ["Contact", [metadata.email, metadata.phone].filter(Boolean).join(" / ")]
  ];
  const rowH = 24;
  const tableY = doc.y;
  rows.forEach(([label, value], index) => {
    const y = tableY + index * rowH;
    doc.rect(left, y, 100, rowH).strokeColor(BORDER).stroke();
    doc.rect(left + 100, y, contentWidth - 100, rowH).strokeColor(BORDER).stroke();
    doc.font("Helvetica-Bold").fontSize(9).fillColor(NAVY).text(label, left + 8, y + 8, { width: 88 });
    doc.font("Helvetica").fillColor("#263D49").text(clean(value), left + 108, y + 8, { width: contentWidth - 116 });
  });
  doc.y = tableY + rows.length * rowH + 15;

  heading(1, "Executive Summary"); box(report.executiveSummary);
  heading(2, "Presenting Concerns"); bullets(report.presentingConcerns);
  heading(3, "Background and History"); box(report.backgroundHistory);
  newPage();
  heading(4, "Clinical Themes"); bullets(report.clinicalThemes);
  heading(5, "Clinical Observations"); bullets(report.clinicalObservations);
  heading(6, "Risk Formulation");
  box(`Risk level: ${clean(report.riskFormulation?.level, "Unknown")}\n\n${clean(report.riskFormulation?.summary)}\n\nCurrent safety assessed: ${report.riskFormulation?.currentSafetyAssessed ? "Yes" : "No - requires direct follow-up"}`);
  bullets([...(report.riskFormulation?.warningSigns || []).map((x) => `Warning sign: ${x}`), ...(report.riskFormulation?.followUp || []).map((x) => `Follow-up: ${x}`)]);
  heading(7, "Protective Factors"); bullets(report.protectiveFactors);
  newPage();
  heading(8, "Reasoning Model"); box(report.reasoningModel);
  heading(9, "Evidence Model"); bullets((report.evidenceModel || []).map((x) => `“${clean(x.excerpt)}” - supports ${clean(x.supports)}`));
  heading(10, "Questions Asked and Why"); bullets((report.questionsAskedAndWhy || []).map((x) => `${clean(x.question)} - ${clean(x.whyAsked)}`), "No questions were recorded in the transcript.");
  heading(11, "Confidence Score"); box(`${clean(report.confidenceScore, "0")}% - ${clean(report.confidenceRationale)}`);
  heading(12, "Keywords / Themes / Notes"); bullets(report.keywords);
  heading(13, "Reviewer Considerations"); bullets(report.reviewerConsiderations);
  if (doc.y > doc.page.height - 190) newPage();
  heading(14, "Facilitator Summary"); box(report.facilitatorSummary);
  if (doc.y > doc.page.height - 175) newPage();
  heading(15, "Clinical Working Notes"); box(report.clinicalWorkingNotes);

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    header();
    footer();
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(`Page ${i + 1} of ${range.count}`, pageWidth - 105, 25, { width: 55, align: "right", lineBreak: false });
  }
  doc.end();
  return new Promise((resolve, reject) => { stream.on("finish", resolve); stream.on("error", reject); });
}
