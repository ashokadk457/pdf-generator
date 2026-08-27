const LAOS_REPORT_JSON_SCHEMA = {
  name: "laos_wendy_style_report",
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "reportTitle",
      "caseCode",
      "patientName",
      "sessionDate",
      "language",
      "executiveSummary",
      "presentingConcerns",
      "backgroundHistory",
      "clinicalThemes",
      "clinicalObservations",
      "riskFormulation",
      "protectiveFactors",
      "reasoningModel",
      "evidenceModel",
      "questionsAskedAndWhy",
      "keywords",
      "confidenceScore",
      "reviewerConsiderations",
      "facilitatorSummary",
      "clinicalWorkingNotes"
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
          type: "object",
          additionalProperties: false,
          required: ["label", "evidence"],
          properties: {
            label: { type: "string" },
            evidence: { type: "string" },
          },
        },
      },
      backgroundHistory: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "details", "evidence"],
          properties: {
            label: { type: "string" },
            details: { type: "string" },
            evidence: { type: "string" },
          },
        },
      },
      clinicalThemes: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["theme", "meaning", "evidence"],
          properties: {
            theme: { type: "string" },
            meaning: { type: "string" },
            evidence: { type: "string" },
          },
        },
      },
      clinicalObservations: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["observation", "clinicalImplication", "evidence"],
          properties: {
            observation: { type: "string" },
            clinicalImplication: { type: "string" },
            evidence: { type: "string" },
          },
        },
      },
      riskFormulation: {
        type: "object",
        additionalProperties: false,
        required: ["riskLevel", "summary", "warningSigns", "protectiveBuffer", "followUpFocus"],
        properties: {
          riskLevel: { type: "string" },
          summary: { type: "string" },
          warningSigns: { type: "array", items: { type: "string" } },
          protectiveBuffer: { type: "array", items: { type: "string" } },
          followUpFocus: { type: "array", items: { type: "string" } },
        },
      },
      protectiveFactors: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["factor", "whyItMatters"],
          properties: {
            factor: { type: "string" },
            whyItMatters: { type: "string" },
          },
        },
      },
      reasoningModel: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["step", "whyItMatters", "evidence"],
          properties: {
            step: { type: "string" },
            whyItMatters: { type: "string" },
            evidence: { type: "string" },
          },
        },
      },
      evidenceModel: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["claim", "supportingEvidence"],
          properties: {
            claim: { type: "string" },
            supportingEvidence: { type: "string" },
          },
        },
      },
      questionsAskedAndWhy: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["question", "whyAsked", "answerEvidence"],
          properties: {
            question: { type: "string" },
            whyAsked: { type: "string" },
            answerEvidence: { type: "string" },
          },
        },
      },
      keywords: { type: "array", items: { type: "string" } },
      confidenceScore: { type: "number" },
      reviewerConsiderations: { type: "array", items: { type: "string" } },
      facilitatorSummary: { type: "string" },
      clinicalWorkingNotes: { type: "string" },
      faithAndMeaning: {
        type: "object",
        additionalProperties: false,
        required: ["present", "summary", "evidence", "followUp"],
        properties: {
          present: { type: "boolean" },
          summary: { type: "string" },
          evidence: { type: "array", items: { type: "string" } },
          followUp: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

function buildLaosReportInstructions({ includeFaithSection = false } = {}) {
  const faithNote = includeFaithSection
    ? [
        "If the transcript clearly includes faith, prayer, scripture, God, Jesus, Trinity, church, or Christian counsel, include a faithAndMeaning section.",
        "If faith is not clearly present, set faithAndMeaning.present to false and keep the summary concise.",
      ].join(" ")
    : "Do not invent a faith section unless the transcript clearly supports it.";

  return [
    "You are writing a clinically grounded LAOS intake report in the Wendy-style format.",
    "Use only what is supported by the transcript and intake data. Do not add generic filler.",
    "Do not guess age, sex, diagnosis, family structure, or background unless the transcript or intake data states it plainly.",
    "Do not guess patient identifiers. If the intake data provides a patient name or case code, use those exactly and never replace them with a transcript inference.",
    "Prefer concise, specific, evidence-linked language over broad summaries.",
    "Preserve the order and tone of a structured clinical report.",
    "Make the report useful to a facilitator who needs to understand what happened, what matters clinically, and what needs follow-up.",
    "Every key conclusion should be supported by transcript evidence or intake metadata.",
    "Do not limit the number of themes, keywords, questions, or evidence items to a small fixed number if the transcript supports more.",
    "Include all clinically relevant items that are supported by the transcript; do not truncate lists to an arbitrary count.",
    faithNote,
  ].join(" ");
}

module.exports = {
  LAOS_REPORT_JSON_SCHEMA,
  buildLaosReportInstructions,
};
