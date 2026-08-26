// Adapted from the supplied laos_report_schema.js for this ES-module project.
// The field names and nested structures are preserved. All properties are
// required so the schema is accepted by strict Structured Outputs.
export const LAOS_REPORT_JSON_SCHEMA = {
  name: "laos_wendy_style_report",
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "reportTitle", "reportSubtitle", "caseCode", "patientName",
      "sessionDate", "reportDate", "language", "sourceTranscriptLanguage",
      "executiveSummary", "presentingConcerns", "backgroundHistory",
      "clinicalThemes", "clinicalObservations", "riskFormulation",
      "protectiveFactors", "reasoningModel", "evidenceModel",
      "questionsAskedAndWhy", "keywords", "confidenceScore",
      "reviewerConsiderations", "facilitatorSummary", "clinicalWorkingNotes",
      "faithAndMeaning"
    ],
    properties: {
      reportTitle: { type: "string" },
      reportSubtitle: { type: "string" },
      caseCode: { type: "string" },
      patientName: { type: "string" },
      sessionDate: { type: "string" },
      reportDate: { type: "string" },
      language: { type: "string" },
      sourceTranscriptLanguage: { type: "string" },
      executiveSummary: { type: "string" },
      presentingConcerns: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: ["label", "evidence"],
          properties: { label: { type: "string" }, evidence: { type: "string" } }
        }
      },
      backgroundHistory: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: ["label", "details", "evidence"],
          properties: {
            label: { type: "string" }, details: { type: "string" }, evidence: { type: "string" }
          }
        }
      },
      clinicalThemes: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: ["theme", "meaning", "evidence"],
          properties: {
            theme: { type: "string" }, meaning: { type: "string" }, evidence: { type: "string" }
          }
        }
      },
      clinicalObservations: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: ["observation", "clinicalImplication", "evidence"],
          properties: {
            observation: { type: "string" }, clinicalImplication: { type: "string" }, evidence: { type: "string" }
          }
        }
      },
      riskFormulation: {
        type: "object", additionalProperties: false,
        required: ["riskLevel", "summary", "warningSigns", "protectiveBuffer", "followUpFocus"],
        properties: {
          riskLevel: { type: "string" }, summary: { type: "string" },
          warningSigns: { type: "array", items: { type: "string" } },
          protectiveBuffer: { type: "array", items: { type: "string" } },
          followUpFocus: { type: "array", items: { type: "string" } }
        }
      },
      protectiveFactors: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: ["factor", "whyItMatters"],
          properties: { factor: { type: "string" }, whyItMatters: { type: "string" } }
        }
      },
      reasoningModel: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: ["step", "whyItMatters", "evidence"],
          properties: {
            step: { type: "string" }, whyItMatters: { type: "string" }, evidence: { type: "string" }
          }
        }
      },
      evidenceModel: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: ["claim", "supportingEvidence"],
          properties: { claim: { type: "string" }, supportingEvidence: { type: "string" } }
        }
      },
      questionsAskedAndWhy: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: ["question", "whyAsked", "answerEvidence"],
          properties: {
            question: { type: "string" }, whyAsked: { type: "string" }, answerEvidence: { type: "string" }
          }
        }
      },
      keywords: { type: "array", items: { type: "string" } },
      confidenceScore: { type: "number", minimum: 0, maximum: 100 },
      reviewerConsiderations: { type: "array", items: { type: "string" } },
      facilitatorSummary: { type: "string" },
      clinicalWorkingNotes: { type: "string" },
      faithAndMeaning: {
        type: "object", additionalProperties: false,
        required: ["present", "summary", "evidence", "followUp"],
        properties: {
          present: { type: "boolean" }, summary: { type: "string" },
          evidence: { type: "array", items: { type: "string" } },
          followUp: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
};

export function buildLaosReportInstructions({ style = "wendy", includeFaithSection = false } = {}) {
  const faithNote = includeFaithSection
    ? "If the transcript clearly includes faith, prayer, scripture, God, Jesus, Trinity, church, or Christian counsel, populate faithAndMeaning. Otherwise set present to false and use empty evidence/followUp arrays."
    : "Set faithAndMeaning.present to false with an empty summary, evidence, and followUp. Do not invent faith content.";

  return [
    "You are writing a clinically grounded LAOS intake report in the Wendy-style format.",
    "Use only what is supported by the transcript and supplied intake metadata. Do not add generic filler or diagnoses.",
    "Prefer concise, specific, evidence-linked language over broad summaries.",
    "Preserve the order and tone of a structured clinical report.",
    "Make the report useful to a facilitator who needs to understand what happened, what matters clinically, and what needs follow-up.",
    "Every key conclusion must be supported by transcript evidence or intake metadata.",
    "Do not claim mood, affect, appearance, behaviour, or current safety was directly observed when the source is text only.",
    "Do not invent questions. If no questions are recorded, return an empty questionsAskedAndWhy array.",
    "For unknown strings use 'Not available from the supplied information'; for absent lists return empty arrays.",
    faithNote,
    style === "wendy" ? "The wording should feel like a careful intake report, not a dashboard summary." : "Match the requested report style exactly."
  ].join(" ");
}
