import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

const NAVY = "#17384A";
const MUTED = "#708696";
const BORDER = "#BCD8E3";

const text = (value, fallback = "Not available") => String(value ?? "").trim() || fallback;
const items = (value, fallback = "Not available from the supplied information") => Array.isArray(value) && value.length ? value : [fallback];

export function createReportPdf({ metadata, report, logoPath, outputPath, includeFaithSection = false }) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const doc = new PDFDocument({ size: "A4", margins: { top: 58, bottom: 0, left: 50, right: 50 }, bufferPages: true });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  const left = 50, width = doc.page.width - 100;

  function drawStaticHeader() {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(NAVY).text("WannaTalk | LAOS Intake Report", left, 25, { lineBreak: false });
    doc.moveTo(left, 39).lineTo(doc.page.width - left, 39).lineWidth(1.5).strokeColor(NAVY).stroke();
  }
  function newPage() { doc.addPage(); doc.x = left; doc.y = 70; }
  function ensure(space = 80) { if (doc.y > doc.page.height - space) newPage(); }
  function heading(n, title) { ensure(75); doc.moveDown(.25).font("Helvetica-Bold").fontSize(14).fillColor(NAVY).text(`${n}. ${title}`); doc.moveDown(.3); }
  function box(value) {
    const valueText = text(value); const h = Math.max(48, doc.heightOfString(valueText, { width: width - 24 }) + 24);
    if (doc.y + h > doc.page.height - 55) newPage();
    const y = doc.y; doc.roundedRect(left, y, width, h, 2).lineWidth(.7).strokeColor(BORDER).stroke();
    doc.font("Helvetica").fontSize(9.2).fillColor("#263D49").text(valueText, left + 12, y + 12, { width: width - 24 }); doc.y = y + h + 4;
  }
  function bullets(values, formatter = (x) => text(x), fallback) {
    const source = Array.isArray(values) && values.length ? values : [fallback || "Not available from the supplied information"];
    for (const value of source) { ensure(70); const rendered = Array.isArray(values) && values.length ? formatter(value) : text(value); doc.font("Helvetica").fontSize(9.2).fillColor("#263D49").text(`- ${rendered}`, left, doc.y, { width }); doc.moveDown(.2); }
  }

  doc.x = left; doc.y = 70;
  if (logoPath && fs.existsSync(logoPath)) { try { doc.image(logoPath, doc.page.width / 2 - 65, 64, { fit: [130, 56] }); } catch {} }
  doc.y = logoPath && fs.existsSync(logoPath) ? 132 : 76;
  doc.font("Helvetica-Bold").fontSize(22).fillColor(NAVY).text(text(report.reportTitle, "WannaTalk"), { align: "center" });
  doc.font("Helvetica").fontSize(10.5).fillColor(MUTED).text(text(report.reportSubtitle, "Intake report for clinical review"), { align: "center" }); doc.moveDown(1);

  const profile = [
    ["Patient", metadata.patientName || report.patientName], ["Age", metadata.age || report.age], ["Gender", metadata.gender || report.gender],
    ["Language", metadata.language || report.language], ["Intake type", metadata.intakeType || report.intakeType],
    ["Reference", metadata.referenceNumber || report.caseCode], ["Contact", [metadata.email, metadata.phone].filter(Boolean).join(" / ")]
  ];
  const y0 = doc.y, rh = 23;
  profile.forEach(([label, value], i) => { const y = y0 + i * rh; doc.rect(left, y, 100, rh).strokeColor(BORDER).stroke(); doc.rect(left + 100, y, width - 100, rh).strokeColor(BORDER).stroke(); doc.font("Helvetica-Bold").fontSize(8.8).fillColor(NAVY).text(label, left + 8, y + 7); doc.font("Helvetica").fillColor("#263D49").text(text(value), left + 108, y + 7, { width: width - 116 }); });
  doc.y = y0 + profile.length * rh + 12;

  heading(1, "Executive Summary"); box(report.executiveSummary);
  heading(2, "Session Summary"); box(report.sessionSummary);
  heading(3, "Presenting Concerns"); bullets(report.presentingConcerns, x => `${text(x.label)} - Evidence: ${text(x.evidence)}`);
  heading(4, "Background and History"); bullets(report.backgroundHistory, x => `${text(x.label)}: ${text(x.details)} - Evidence: ${text(x.evidence)}`);
  newPage(); heading(5, "Clinical Themes"); bullets(report.clinicalThemes, x => `${text(x.theme)} - ${text(x.meaning)} - Evidence: ${text(x.evidence)}`);
  heading(6, "Clinical Observations"); bullets(report.clinicalObservations, x => `${text(x.observation)} - Implication: ${text(x.clinicalImplication)} - Evidence: ${text(x.evidence)}`);
  heading(7, "Risk Formulation"); box(`Risk level: ${text(report.riskFormulation?.riskLevel, "Unknown")}\n\n${text(report.riskFormulation?.summary)}`);
  bullets([...(report.riskFormulation?.warningSigns || []).map(x => `Warning sign: ${x}`), ...(report.riskFormulation?.protectiveBuffer || []).map(x => `Protective buffer: ${x}`), ...(report.riskFormulation?.followUpFocus || []).map(x => `Follow-up: ${x}`)]);
  heading(8, "Protective Factors"); bullets(report.protectiveFactors, x => `${text(x.factor)} - ${text(x.whyItMatters)}`);
  newPage(); heading(9, "Reasoning Model"); bullets(report.reasoningModel, x => `${text(x.step)} - ${text(x.whyItMatters)} - Evidence: ${text(x.evidence)}`);
  heading(10, "Evidence Model"); bullets(report.evidenceModel, x => `${text(x.claim)} - ${text(x.supportingEvidence)}`);
  heading(11, "Questions Asked and Why"); bullets(report.questionsAskedAndWhy, x => `${text(x.question)} - Why: ${text(x.whyAsked)} - Answer/evidence: ${text(x.answerEvidence)}`, "No questions were recorded in the transcript.");
  heading(12, "Recommended Follow-up Questions"); bullets(report.recommendedFollowUpQuestions, x => `${text(x.question)} - Why: ${text(x.whyAsked)} - Answer/evidence: ${text(x.answerEvidence)}`, "No follow-up questions were recommended.");
  heading(13, "Confidence Score"); box(`${Number(report.confidenceScore || 0).toFixed(0)}%`);
  heading(14, "Keywords / Themes / Notes"); bullets([
    ...(report.keywords || []).map(x => `Keyword: ${x}`)
  ]);
  heading(15, "Reviewer Considerations"); bullets(report.reviewerConsiderations);
  ensure(180); heading(16, "Facilitator Summary"); box(report.facilitatorSummary);
  ensure(170); heading(17, "Clinical Working Notes"); box(report.clinicalWorkingNotes);

  if (includeFaithSection && report.faithAndMeaning?.present) {
    ensure(170); doc.font("Helvetica-Bold").fontSize(14).fillColor(NAVY).text("Faith / Meaning Framework");
    box(report.faithAndMeaning.summary);
    bullets([...(report.faithAndMeaning.evidence || []).map(x => `Evidence: ${x}`), ...(report.faithAndMeaning.followUp || []).map(x => `Follow-up: ${x}`)]);
  }

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) { doc.switchToPage(i); drawStaticHeader(); doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(`Page ${i + 1} of ${range.count}`, doc.page.width - 105, 25, { width: 55, align: "right", lineBreak: false }); doc.text("Talk it out. You are not alone.", left, doc.page.height - 30, { width, align: "center", lineBreak: false }); }
  doc.end();
  return new Promise((resolve, reject) => { stream.on("finish", resolve); stream.on("error", reject); });
}
