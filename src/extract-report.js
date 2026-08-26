import OpenAI from "openai";
import { reportSchema } from "./report-schema.js";

export async function extractReport(transcript) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    store: false,
    instructions: [
      "Create a cautious LAOS clinical intake report from the transcript only.",
      "Do not diagnose, invent facts, invent questions, or imply direct behavioural observation from text.",
      "Use null for missing demographics and empty arrays for absent list content.",
      "Language may be inferred from the writing, but languageBasis must say inferred.",
      "Set currentSafetyAssessed true only if current safety, self-harm, suicide, or immediate danger was directly assessed.",
      "Evidence excerpts must be short verbatim excerpts from the transcript.",
      "Reviewer considerations and working notes may recommend cautious follow-up and must distinguish recommendation from known fact."
    ].join(" "),
    input: transcript,
    text: {
      format: {
        type: "json_schema",
        name: "laos_intake_report",
        strict: true,
        schema: reportSchema
      }
    }
  });
  if (!response.output_text) throw new Error("OpenAI returned no report content");
  return JSON.parse(response.output_text);
}
