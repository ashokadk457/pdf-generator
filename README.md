# WannaTalk LAOS Report Generator

This Node.js service accepts patient metadata and a `.txt` transcript, sends the latest client-supplied Wendy-style LAOS instructions and exact `laos_wendy_style_report` schema through the official OpenAI Node SDK, and renders the structured result as a branded clinical PDF.

## Run

```powershell
npm install
Copy-Item .env.example .env
npm start
```

Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in `.env`, then open `http://localhost:3000`. `OPENAI_MAX_OUTPUT_TOKENS` defaults to `8000` so full structured reports are not cut off. `LOGO_PATH` may point to a separate PNG or JPEG logo.

Interactive Swagger documentation: `http://localhost:3000/api-docs`

Raw OpenAPI JSON: `http://localhost:3000/api-docs.json`

## Client integration

- `src/laos_report_schema_v2.cjs` is an exact content copy of the latest client schema and includes the client's `buildLaosReportInstructions` function.
- `src/extract-report.js` applies the latest service flow: Wendy-style instructions, intake metadata, transcript, model selection, metadata normalization, and the official OpenAI Responses API.
- The supplied `clinical.js` belongs to a different CommonJS clinical-library/job router. Its applicable report-generation behavior was integrated without importing its unrelated job storage and router endpoints.
- `src/pdf.js` maps the latest fields, including `caseCode` and `backgroundHistory`, into the existing PDF template.
- The schema is sent with `strict: false` because the exact client file defines optional properties; changing this to strict mode without revising its `required` arrays causes OpenAI schema validation errors.

The uploaded patient's name, age, gender, language, intake type, and reference number are supplied as request metadata. Email and phone remain PDF contact fields; they are not added to the clinical model schema because the client schema does not define them.

## Flow

1. The browser submits metadata plus one plain-text transcript.
2. The server fills the client user-prompt template with the frozen references, metadata, and transcript.
3. OpenAI's Responses API returns JSON constrained by the exact client schema.
4. The server saves the complete parsed response to `output/json/WannaTalk-<reference>-<id>.json`.
5. The server uses that saved response data to produce the downloadable PDF.

Run `npm run sample` to generate `output/pdf/WannaTalk-schema-sample.pdf` without calling an API.

Clinical output must still be reviewed by an appropriately qualified human, particularly risk and safety content.
