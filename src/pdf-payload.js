const list = (value) => Array.isArray(value) ? value : [];
const clean = (value) => String(value || "").trim();

function evidenceLine(label, details, evidence) {
  return [clean(label), clean(details), clean(evidence) && `Evidence: ${clean(evidence)}`].filter(Boolean).join(" - ");
}

export function createPythonPdfPayload({ report, metadata, includeFaithSection = false }) {
  const risk = report.riskFormulation || {};
  const sections = [
    {
      title: "1. DSP Identification", kind: "table", columns: ["Field", "Value"],
      rows: [
        ["Case code", metadata.referenceNumber || report.caseCode], ["Patient", metadata.patientName || report.patientName],
        ["Session date", metadata.sessionDate || report.sessionDate], ["Language", metadata.language || report.language],
        ["Age", metadata.age], ["Gender", metadata.gender], ["Intake type", metadata.intakeType],
        ["Contact", [metadata.email, metadata.phone].filter(Boolean).join(" / ")],
      ],
    },
    {
      title: "2. Presenting Concern", kind: "bullets",
      bullets: [
        clean(report.executiveSummary) && `Executive summary: ${clean(report.executiveSummary)}`,
        clean(report.sessionSummary) && `Session summary: ${clean(report.sessionSummary)}`,
        ...list(report.presentingConcerns).map((x) => evidenceLine(x.label, "", x.evidence)),
        ...list(report.backgroundHistory).map((x) => evidenceLine(x.label, x.details, x.evidence)),
      ].filter(Boolean),
    },
    {
      title: "3. Key Observations", kind: "bullets",
      bullets: [
        ...list(report.clinicalThemes).map((x) => evidenceLine(x.theme, x.meaning, x.evidence)),
        ...list(report.clinicalObservations).map((x) => evidenceLine(x.observation, x.clinicalImplication, x.evidence)),
        clean(risk.riskLevel) && `Risk level: ${clean(risk.riskLevel)}`, clean(risk.summary),
        ...list(risk.warningSigns).map((x) => `Warning sign: ${clean(x)}`),
        ...list(risk.protectiveBuffer).map((x) => `Protective buffer: ${clean(x)}`),
        ...list(report.protectiveFactors).map((x) => evidenceLine(x.factor, x.whyItMatters, "")),
      ].filter(Boolean),
    },
    {
      title: "4. Questions Asked and Why", kind: "table", columns: ["Question", "Why asked", "Answer / evidence"],
      rows: list(report.questionsAskedAndWhy).map((x) => [clean(x.question), clean(x.whyAsked), clean(x.answerEvidence)]),
    },
    {
      title: "5. Reasoning Model", kind: "table", columns: ["Step", "Why it matters", "Evidence"],
      rows: list(report.reasoningModel).map((x) => [clean(x.step), clean(x.whyItMatters), clean(x.evidence)]),
    },
    {
      title: "6. Evidence Model", kind: "table", columns: ["Claim", "Supporting evidence"],
      rows: list(report.evidenceModel).map((x) => [clean(x.claim), clean(x.supportingEvidence)]),
    },
    {
      title: "7. Confidence and Uncertainty", kind: "bullets",
      bullets: [`Confidence score: ${Number(report.confidenceScore || 0).toFixed(0)}%`, ...list(report.reviewerConsiderations).map(clean)],
    },
    {
      title: "8. Keywords and Patient Bible Notes", kind: "bullets",
      bullets: [...list(report.keywords).map((x) => `Keyword: ${clean(x)}`), clean(report.clinicalWorkingNotes)].filter(Boolean),
    },
    {
      title: "9. LAOS Learning Summary", kind: "text",
      text: clean(report.facilitatorSummary || report.executiveSummary),
    },
    {
      title: "10. Follow-up and Next Steps", kind: "table", columns: ["Question", "Why ask", "Answer / evidence"],
      rows: [
        ...list(report.recommendedFollowUpQuestions).map((x) => [clean(x.question), clean(x.whyAsked), clean(x.answerEvidence)]),
        ...list(risk.followUpFocus).map((x) => [clean(x), "Risk formulation follow-up", "Not answered in transcript"]),
      ],
    },
  ];

  const faith = report.faithAndMeaning || {};
  return {
    title: clean(report.reportTitle || "LAOS DSP Template Report"),
    summary: clean(report.executiveSummary || report.facilitatorSummary),
    reportText: [report.executiveSummary, report.sessionSummary, report.facilitatorSummary, report.clinicalWorkingNotes].map(clean).filter(Boolean).join("\n\n"),
    meta: {
      caseCode: clean(metadata.referenceNumber || report.caseCode), caseName: clean(report.caseCode),
      patient: clean(metadata.patientName || report.patientName), language: clean(metadata.language || report.language),
      sessionDate: clean(metadata.sessionDate || report.sessionDate), preparedBy: clean(process.env.REPORT_PREPARED_BY || "Louw Alberts"), status: "Working draft",
    },
    sections,
    faithSection: includeFaithSection && faith.present ? { title: "Faith / Meaning Framework", kind: "text", text: [faith.summary, ...list(faith.evidence).map((x) => `Evidence: ${clean(x)}`), ...list(faith.followUp).map((x) => `Follow-up: ${clean(x)}`)].map(clean).filter(Boolean).join("\n") } : null,
    includeFaithAppendix: Boolean(includeFaithSection && faith.present),
  };
}
