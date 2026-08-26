import OpenAI from "openai";
import { REPORT_SCHEMA } from "./laos-report-schema.js";

export async function extractLaosReport({ transcriptText, metadata, reportStyle = "wendy", includeFaithSection = false }) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  const transcript = String(transcriptText || "").trim();
  if (!transcript) throw new Error("Transcript text is required");

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    store: false,
    input: [{
      role: "user",
      content: [{
        type: "input_text",
        text: [
          "Generate the LAOS report from the intake metadata and transcript.",
          "Use metadata for patient identity, case code, contact context, intake type, and dates.",
          `Intake metadata: ${JSON.stringify(metadata)}`,
          "Transcript:",
          transcript
        ].join("\n\n")
      }]
    }],
    text: {
      format: {
        type: "json_schema",
        name: REPORT_SCHEMA.name,
        schema: REPORT_SCHEMA.schema,
        strict: REPORT_SCHEMA.strict
      }
    }
  });

  if (!response.output_text) throw new Error("OpenAI returned no report content");
  return JSON.parse(response.output_text);
}
