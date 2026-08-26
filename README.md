# WannaTalk LAOS Report Generator

This Node.js service accepts patient metadata and a `.txt` transcript, sends the client-supplied frozen LAOS prompt pack and exact `laos_dsp_style_report_v2` schema through the official OpenAI Node SDK, and renders the structured result as a branded clinical PDF.

## Run

```powershell
npm install
Copy-Item .env.example .env
npm start
```

Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in `.env`, then open `http://localhost:3000`. `LOGO_PATH` may point to a separate PNG or JPEG logo.

Interactive Swagger documentation: `http://localhost:3000/api-docs`

Raw OpenAPI JSON: `http://localhost:3000/api-docs.json`

## Client pack integration

- `src/laos_report_schema_v2.cjs` is an exact content copy of the client's v2 schema (the `.cjs` extension lets the CommonJS export load in this ESM project).
- `laos/laos_system_prompt.txt` and `laos/laos_user_prompt_template.txt` are sent unchanged.
- `laos/LAOS_Whiteboard_One_Master.md` and `laos/LAOS_C1_Checkpoint.md` fill the prompt placeholders unchanged.
- `laos/LAOS_Transcript_Reading_Workflow.md` and `laos/acceptance_tests.md` are retained as client reference documents.
- `src/extract-report.js` uses the official `openai` SDK and Responses API while retaining the client's temperature, token limit, message layout, and strict schema request.
- `src/pdf.js` maps the exact v2 JSON fields into the existing PDF template.

The uploaded patient's name, age, gender, language, intake type, and reference number are supplied as request metadata. Email and phone remain PDF contact fields; they are not added to the clinical model schema because the client schema does not define them.

## Flow

1. The browser submits metadata plus one plain-text transcript.
2. The server fills the client user-prompt template with the frozen references, metadata, and transcript.
3. OpenAI's Responses API returns JSON constrained by the exact client schema.
4. The server parses that JSON and produces the downloadable PDF.

Run `npm run sample` to generate `output/pdf/WannaTalk-schema-sample.pdf` without calling an API.

Clinical output must still be reviewed by an appropriately qualified human, particularly risk and safety content.
