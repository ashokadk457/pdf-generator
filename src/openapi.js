export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "WannaTalk LAOS Report Generator API",
    version: "1.1.0",
    description: "Upload patient intake metadata and a plain-text transcript to generate a LAOS clinical report PDF.",
  },
  servers: [{ url: "http://localhost:3000", description: "Local development server" }],
  paths: {
    "/api/reports": {
      post: {
        summary: "Generate a LAOS PDF report",
        description: "Sends the transcript through the configured LAOS-compatible Responses API and returns the generated PDF.",
        operationId: "generateLaosReport",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["patientName", "referenceNumber", "intakeType", "transcript"],
                properties: {
                  patientName: { type: "string", example: "Wendy Bowley" },
                  referenceNumber: { type: "string", example: "WT-001" },
                  email: { type: "string", format: "email", example: "wendy@example.com", description: "Email or phone is required." },
                  phone: { type: "string", example: "+44 7700 900123", description: "Phone or email is required." },
                  intakeType: { type: "string", example: "text" },
                  sessionDate: { type: "string", format: "date", example: "2026-08-26" },
                  language: { type: "string", example: "English" },
                  age: { type: "string", example: "51" },
                  gender: { type: "string", example: "Female" },
                  transcript: { type: "string", format: "binary", description: "Plain-text transcript file (.txt), maximum 2 MB." },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Generated PDF report", content: { "application/pdf": { schema: { type: "string", format: "binary" } } } },
          400: { description: "Invalid metadata or transcript", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Report generation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
  },
  components: { schemas: { Error: { type: "object", properties: { error: { type: "string" }, details: { type: "string" } }, required: ["error"] } } },
};
