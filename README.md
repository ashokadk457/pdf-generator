# WannaTalk Intake PDF Generator

A small Node.js application that accepts patient metadata and a UTF-8 `.txt` transcript, extracts a cautious structured clinical summary with the OpenAI Responses API, and generates a branded PDF matching the supplied 15-section LAOS intake-report format.

## Setup

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` and set `OPENAI_API_KEY`. Keep this key on the server; never put it in browser JavaScript. Optionally set `LOGO_PATH` to an absolute PNG or JPEG path. Then run:

```powershell
npm start
```

Open `http://localhost:3000`. Generated reports are also saved under `output/pdf/`.

To verify PDF generation without calling OpenAI:

```powershell
npm run sample
```

## Extraction rules

- Patient name, reference number, email/phone, and intake type come from the submitted form.
- Age and gender may be extracted only when explicitly stated in the transcript.
- Language may be marked as inferred.
- Unavailable fields remain `null` or are printed as `Not available`.
- Narrative text alone is not presented as a direct observation of appearance, mood, or behaviour.
- Current safety is marked as not assessed unless the transcript explicitly addresses it.
- Questions are included only when they actually appear in the transcript.
- The generated report is a clinical-review aid, not a diagnosis.

## API

`POST /api/reports` as `multipart/form-data`:

- `patientName` (required)
- `referenceNumber` (required)
- `email` or `phone` (at least one required)
- `intakeType` (`text`, `voice`, or `mixed`)
- `transcript` (required `.txt` file, maximum 2 MB)

The response is the generated PDF.
