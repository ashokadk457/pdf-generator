const LAOS_DSP_REPORT_SCHEMA_V2 = {
  name: "laos_dsp_style_report_v2",
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "reportTitle",
      "patientName",
      "language",
      "executiveSummary",
      "presentingConcerns",
      "backgroundAndHistory",
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
      "clinicalWorkingNotes",
    ],
    properties: {
      reportTitle: { type: "string" },
      reportSubtitle: { type: "string" },
      patientName: { type: "string" },
      age: { type: "string" },
      gender: { type: "string" },
      sessionDate: { type: "string" },
      reportDate: { type: "string" },
      language: { type: "string" },
      sourceTranscriptLanguage: { type: "string" },
      intakeType: { type: "string" },
      reference: { type: "string" },
      executiveSummary: { type: "string" },
      presentingConcerns: {
        type: "array",
        minItems: 1,
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
      backgroundAndHistory: {
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
      themesAndNotes: {
        type: "array",
        items: { type: "string" },
      },
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

module.exports = {
  LAOS_DSP_REPORT_SCHEMA_V2,
};

