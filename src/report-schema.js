export const reportSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "age", "gender", "language", "languageBasis", "executiveSummary",
    "presentingConcerns", "backgroundHistory", "clinicalThemes",
    "clinicalObservations", "riskFormulation", "protectiveFactors",
    "reasoningModel", "evidenceModel", "questionsAskedAndWhy",
    "confidenceScore", "confidenceRationale", "keywords",
    "reviewerConsiderations", "facilitatorSummary", "clinicalWorkingNotes"
  ],
  properties: {
    age: { type: ["integer", "null"] },
    gender: { type: ["string", "null"] },
    language: { type: ["string", "null"] },
    languageBasis: { type: "string", enum: ["explicit", "inferred", "unknown"] },
    executiveSummary: { type: "string" },
    presentingConcerns: { type: "array", items: { type: "string" } },
    backgroundHistory: { type: "string" },
    clinicalThemes: { type: "array", items: { type: "string" } },
    clinicalObservations: { type: "array", items: { type: "string" } },
    riskFormulation: {
      type: "object", additionalProperties: false,
      required: ["level", "summary", "currentSafetyAssessed", "warningSigns", "followUp"],
      properties: {
        level: { type: "string", enum: ["low", "medium", "high", "urgent", "unknown"] },
        summary: { type: "string" },
        currentSafetyAssessed: { type: "boolean" },
        warningSigns: { type: "array", items: { type: "string" } },
        followUp: { type: "array", items: { type: "string" } }
      }
    },
    protectiveFactors: { type: "array", items: { type: "string" } },
    reasoningModel: { type: "string" },
    evidenceModel: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["excerpt", "supports"],
        properties: { excerpt: { type: "string" }, supports: { type: "string" } }
      }
    },
    questionsAskedAndWhy: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["question", "whyAsked"],
        properties: { question: { type: "string" }, whyAsked: { type: "string" } }
      }
    },
    confidenceScore: { type: "integer", minimum: 0, maximum: 100 },
    confidenceRationale: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    reviewerConsiderations: { type: "array", items: { type: "string" } },
    facilitatorSummary: { type: "string" },
    clinicalWorkingNotes: { type: "string" }
  }
};
