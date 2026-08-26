import fs from "node:fs/promises";
import { createRequire } from "node:module";
import OpenAI from "openai";

const require = createRequire(import.meta.url);
const { LAOS_DSP_REPORT_SCHEMA_V2 } = require("./laos_report_schema_v2.cjs");
const [systemPrompt, userPromptTemplate, whiteboardText, checkpointText] = await Promise.all([
  fs.readFile(new URL("../laos/laos_system_prompt.txt", import.meta.url), "utf8"),
  fs.readFile(new URL("../laos/laos_user_prompt_template.txt", import.meta.url), "utf8"),
  fs.readFile(new URL("../laos/LAOS_Whiteboard_One_Master.md", import.meta.url), "utf8"),
  fs.readFile(new URL("../laos/LAOS_C1_Checkpoint.md", import.meta.url), "utf8"),
]);

function fillTemplate(template, values) {
  return template.replace("{{WHITEBOARD_ONE_TEXT}}", values.whiteboardText || "").replace("{{CHECKPOINT_TEXT}}", values.checkpointText || "").replace("{{PATIENT_NAME}}", values.patientName || "Unknown").replace("{{AGE_OR_UNKNOWN}}", values.age || "Unknown").replace("{{GENDER_OR_UNKNOWN}}", values.gender || "Unknown").replace("{{LANGUAGE}}", values.language || "en").replace("{{INTAKE_TYPE}}", values.intakeType || "Unknown").replace("{{REFERENCE_OR_UNKNOWN}}", values.reference || "Unknown").replace("{{TRANSCRIPT_TEXT}}", values.transcriptText || "");
}

export async function extractLaosReport({ transcriptText, metadata = {} }) {
  const transcript = String(transcriptText || "").trim();
  if (!transcript) throw new Error("Transcript text is required");
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const userPrompt = fillTemplate(userPromptTemplate, { whiteboardText, checkpointText, transcriptText: transcript, patientName: metadata.patientName || "Unknown", age: metadata.age || "Unknown", gender: metadata.gender || "Unknown", language: metadata.language || "en", intakeType: metadata.intakeType || "Unknown", reference: metadata.referenceNumber || "Unknown" });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini", temperature: 0.2, max_output_tokens: 1800,
    input: [{ role: "system", content: [{ type: "input_text", text: systemPrompt }] }, { role: "user", content: [{ type: "input_text", text: userPrompt }] }],
    text: { format: { type: "json_schema", name: LAOS_DSP_REPORT_SCHEMA_V2.name, strict: false, schema: LAOS_DSP_REPORT_SCHEMA_V2.schema } },
  });
  if (!response.output_text) throw new Error("The LAOS API returned no report content");
  return JSON.parse(response.output_text);
}
