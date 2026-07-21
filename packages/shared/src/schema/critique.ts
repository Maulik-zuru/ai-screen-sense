import { z } from "zod";

export const BoundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;

export const SeveritySchema = z.enum(["info", "warning", "critical"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const CritiqueSourceSchema = z.enum(["llm", "deterministic", "council"]);
export type CritiqueSource = z.infer<typeof CritiqueSourceSchema>;

export const CodeFixSchema = z.object({
  language: z.string(),
  before: z.string().optional(),
  after: z.string(),
});
export type CodeFix = z.infer<typeof CodeFixSchema>;

export const CritiqueSchema = z.object({
  id: z.string(),
  personaId: z.string(),
  severity: SeveritySchema,
  spokenText: z.string().max(240),
  transcriptText: z.string(),
  codeFix: CodeFixSchema.optional(),
  region: BoundingBoxSchema.optional(),
  confidence: z.number().min(0).max(1),
  source: CritiqueSourceSchema,
});
export type Critique = z.infer<typeof CritiqueSchema>;

/** The JSON schema every provider adapter must coerce its output into. */
export const CritiqueListSchema = z.object({
  critiques: z.array(CritiqueSchema),
});
export type CritiqueList = z.infer<typeof CritiqueListSchema>;

export const CritiqueSummarySchema = z.object({
  personaId: z.string(),
  transcriptText: z.string(),
});
export type CritiqueSummary = z.infer<typeof CritiqueSummarySchema>;

export const DeterministicFindingSchema = z.object({
  kind: z.literal("contrast"),
  foreground: z.string(),
  background: z.string(),
  ratio: z.number(),
  passesAA: z.boolean(),
  region: BoundingBoxSchema.optional(),
});
export type DeterministicFinding = z.infer<typeof DeterministicFindingSchema>;

export const FrameSchema = z.object({
  imageBase64: z.string(),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  width: z.number(),
  height: z.number(),
});
export type Frame = z.infer<typeof FrameSchema>;

export const ModelPreferenceSchema = z.object({
  provider: z.enum(["openai", "anthropic", "gemini", "openrouter"]),
  model: z.string(),
});
export type ModelPreference = z.infer<typeof ModelPreferenceSchema>;

export const UxAnalysisRequestSchema = z.object({
  personaId: z.string(),
  systemPrompt: z.string(),
  frame: FrameSchema,
  deterministicFindings: z.array(DeterministicFindingSchema).default([]),
  priorCritiques: z.array(CritiqueSummarySchema).default([]),
  /** Ordered list of provider+model to try; the router falls back to the next entry on failure. */
  modelPreferenceChain: z.array(ModelPreferenceSchema).min(1),
});
export type UxAnalysisRequest = z.infer<typeof UxAnalysisRequestSchema>;

export const ProviderMetaSchema = z.object({
  provider: z.string(),
  model: z.string(),
  latencyMs: z.number(),
  tokensIn: z.number().optional(),
  tokensOut: z.number().optional(),
});
export type ProviderMeta = z.infer<typeof ProviderMetaSchema>;

export const UxAnalysisResponseSchema = z.object({
  critiques: z.array(CritiqueSchema),
  rawProviderMeta: ProviderMetaSchema,
});
export type UxAnalysisResponse = z.infer<typeof UxAnalysisResponseSchema>;
