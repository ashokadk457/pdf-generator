import { createRequire } from "node:module";
import OpenAI from "openai";

const require = createRequire(import.meta.url);
const { LAOS_REPORT_JSON_SCHEMA, buildLaosReportInstructions } = require("./laos_report_schema_v2.cjs");

function firstString(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function normalizeReportMetadata(report, intake = {}) {
  const reportDate = firstString(intake.reportDate, report.reportDate, new Date().toISOString());
  report.reportTitle = firstString(report.reportTitle, "LAOS Wendy Style Report");
  report.caseCode = firstString(intake.referenceNumber, intake.reference, report.caseCode);
  report.patientName = firstString(intake.patientName, intake.fullName, report.patientName);
  report.sessionDate = firstString(intake.sessionDate, report.sessionDate, reportDate);
  report.reportDate = reportDate;
  report.language = firstString(intake.language, report.language, "en");
  report.sourceTranscriptLanguage = firstString(intake.sourceTranscriptLanguage, report.sourceTranscriptLanguage, report.language);
  const confidence = Number(report.confidenceScore);
  report.confidenceScore = Number.isFinite(confidence) ? Math.max(0, Math.min(100, confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence))) : 0;
  return report;
}

export async function extractLaosReport({ transcriptText, metadata = {}, reportStyle = "wendy", includeFaithSection = false }) {
  const transcript = String(transcriptText || "").trim();
  if (!transcript) throw new Error("Transcript text is required");
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.LAOS_REPORT_MODEL || process.env.OPENAI_REPORT_MODEL || process.env.OPENAI_MODEL || "gpt-5.4-mini",
    instructions: buildLaosReportInstructions({ style: reportStyle, includeFaithSection }),
    input: [{
      role: "user",
      content: [{
        type: "input_text",
        text: [
          "Generate the LAOS report JSON from the transcript and intake data below.",
          "Return only JSON that matches the schema.",
          "",
          `Intake data: ${JSON.stringify(metadata)}`,
          "",
          "Transcript:",
          transcript,
        ].join("\n"),
      }],
    }],
    text: { format: { type: "json_schema", name: LAOS_REPORT_JSON_SCHEMA.name, schema: LAOS_REPORT_JSON_SCHEMA.schema, strict: false } },
    max_output_tokens: Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 8000),
  });

  if (response.status === "incomplete") {
    const reason = response.incomplete_details?.reason || "unknown reason";
    throw new Error(`OpenAI returned an incomplete report (${reason}). Increase OPENAI_MAX_OUTPUT_TOKENS if needed.`);
  }
  const jsonText = String(response.output_text || "").trim();
  if (!jsonText) throw new Error("OpenAI returned no LAOS report content");
  try {
    return normalizeReportMetadata(JSON.parse(jsonText), metadata);
  } catch {
    throw new Error("OpenAI returned invalid or truncated report JSON. Retry the request; if it repeats, increase OPENAI_MAX_OUTPUT_TOKENS.");
  }
}
