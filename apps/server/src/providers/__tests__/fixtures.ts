import type { UxAnalysisRequest, Critique } from "@ai-screen-sense/shared";

export function buildTestRequest(
  overrides: Partial<UxAnalysisRequest> = {}
): UxAnalysisRequest {
  return {
    personaId: "ux-generalist",
    systemPrompt: "You are the UX Generalist.",
    frame: {
      imageBase64: "ZmFrZS1pbWFnZS1ieXRlcw==",
      mimeType: "image/jpeg",
      width: 1280,
      height: 720,
    },
    deterministicFindings: [],
    priorCritiques: [],
    modelPreferenceChain: [{ provider: "openai", model: "gpt-4o" }],
    ...overrides,
  };
}

export function sampleCritique(overrides: Partial<Critique> = {}): Critique {
  return {
    id: "c1",
    personaId: "ux-generalist",
    severity: "warning",
    spokenText: "The primary button is too small to tap reliably.",
    transcriptText: "The primary CTA button measures below the 44x44 tap-target minimum.",
    confidence: 0.8,
    source: "llm",
    ...overrides,
  };
}
