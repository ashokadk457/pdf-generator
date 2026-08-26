# WannaTalk LAOS Report Generator

This Node.js service accepts patient metadata and a `.txt` transcript, instructs the OpenAI Responses API with the supplied Wendy-style LAOS schema, and generates a branded PDF in the supplied 15-section template format.

## Run

```powershell
npm install
Copy-Item .env.example .env
# Add OPENAI_API_KEY and optional LOGO_PATH to .env
npm start
```

Open `http://localhost:3000`.

The exact schema is implemented in `src/laos-report-schema.js`. The API call is in `src/extract-report.js`. The PDF mapping is in `src/pdf.js`.
