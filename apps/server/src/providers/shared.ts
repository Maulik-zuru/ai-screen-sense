import type { UxAnalysisRequest } from "@ai-screen-sense/shared";

/** Shared context block (deterministic findings + anti-repeat history) every adapter prepends to its prompt. */
export function buildContextText(req: UxAnalysisRequest): string {
  return [
    req.deterministicFindings.length > 0
      ? `Deterministic findings (ground truth, do not re-estimate these):\n${JSON.stringify(
          req.deterministicFindings
        )}`
      : null,
    req.priorCritiques.length > 0
      ? `Already-reported critiques this session (do not repeat):\n${JSON.stringify(
          req.priorCritiques
        )}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  return JSON.parse(candidate.trim());
}
