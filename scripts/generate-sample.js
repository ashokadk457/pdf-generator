import path from "node:path";
import { createReportPdf } from "../src/pdf.js";

const metadata = { patientName: "Sample Patient", referenceNumber: "WT-SAMPLE-001", email: "sample@example.com", phone: "", intakeType: "text", sessionDate: "2026-08-26", language: "English", age: "51", gender: "Female" };
const report = {
  reportTitle: "WannaTalk", reportSubtitle: "Intake report for clinical review", patientName: "Sample Patient", age: "51", gender: "Female", language: "English", intakeType: "text", reference: "WT-SAMPLE-001",
  executiveSummary: "The patient describes longstanding emotional pain connected to adverse childhood experiences, loneliness, relationship difficulty, and self-worth concerns. The narrative also shows insight, meaning-seeking, and engagement in healing.",
  presentingConcerns: [{ label: "Loneliness and relational difficulty", evidence: "The patient describes a long and lonely journey and difficulty navigating relationships." }, { label: "Self-worth", evidence: "The patient reports difficulty believing she is loved." }],
  backgroundAndHistory: [{ label: "Family environment", details: "The patient describes an unstable and emotionally neglectful childhood.", evidence: "Both parents are described as alcohol-dependent, cruel, and absent." }],
  clinicalThemes: [{ theme: "Attachment and belonging", meaning: "Early relational experiences may inform current difficulty feeling securely connected.", evidence: "The patient describes feeling like an outsider and waiting for parental love." }],
  clinicalObservations: [{ observation: "The written narrative is reflective and coherent.", clinicalImplication: "The account provides usable self-reported history while direct behavioural observation remains unavailable.", evidence: "The transcript links past experiences to current relationship patterns." }],
  riskFormulation: { riskLevel: "Unknown - current safety not assessed", summary: "The transcript contains vulnerability factors but no direct current-safety assessment.", warningSigns: ["Emotional distress", "Loneliness"], protectiveBuffer: ["Help-seeking", "Meaning-seeking"], followUpFocus: ["Assess current safety directly", "Clarify support network"] },
  protectiveFactors: [{ factor: "Engagement in healing", whyItMatters: "Shows persistence and willingness to seek support." }],
  reasoningModel: [{ step: "Connect reported early experiences with current patterns", whyItMatters: "Provides a cautious working formulation without diagnosis.", evidence: "The patient explicitly describes these experiences as a recurring life theme." }],
  evidenceModel: [{ claim: "Relational pain is longstanding", supportingEvidence: "The patient describes this as a theme for most of her life." }],
  questionsAskedAndWhy: [], confidenceScore: 85,
  keywords: ["loneliness", "attachment", "self-worth", "healing"], themesAndNotes: { themes: ["belonging", "recovery"], notes: ["Current safety requires direct assessment"] },
  reviewerConsiderations: ["Assess current safety and coping directly", "Clarify present supports"],
  facilitatorSummary: "The patient presents a reflective account of longstanding relational hurt, loneliness, and self-worth difficulty, with meaningful insight and engagement in healing.",
  clinicalWorkingNotes: "Working summary only; compare with the original transcript and complete direct safety assessment.",
  faithAndMeaning: { present: false, summary: "", evidence: [], followUp: [] },
};
const outputPath = path.resolve("output/pdf/WannaTalk-schema-sample.pdf");
await createReportPdf({ metadata, report, logoPath: process.env.LOGO_PATH || "", outputPath, includeFaithSection: false });
console.log(outputPath);
