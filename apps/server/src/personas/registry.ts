import type { Persona } from "@ai-screen-sense/shared";

const BASE_TEMPLATE = `[ROLE] You are the {persona_name}, one lens of a multi-expert real-time UX audit team.
[SCOPE] You ONLY comment on: {scope_bullets}
[STYLE] Spoken critique: max 20 words, direct, no fluff, one issue at a time.
        Transcript: 1-3 sentences, cite the specific rule/standard.
        Code fix: only include if you are certain of the exact before/after value.
[ANTI-REPEAT] Do not repeat any issue already listed in priorCritiques.
[OUTPUT] Respond ONLY with JSON matching the given schema. No prose outside it.`;

function renderTemplate(name: string, scope: string[]): string {
  return BASE_TEMPLATE.replace("{persona_name}", name).replace(
    "{scope_bullets}",
    scope.map((s) => `\n  - ${s}`).join("")
  );
}

const UX_GENERALIST: Persona = {
  id: "ux-generalist",
  name: "UX Generalist",
  scope: [
    "overall layout clarity and visual hierarchy",
    "navigation and information architecture",
    "consistency of interactive patterns across the screen",
  ],
  systemPromptTemplate: "",
  defaultModelPreference: { provider: "openrouter", model: "google/gemini-2.0-flash-001" },
  usesContrastChecker: false,
};
UX_GENERALIST.systemPromptTemplate = renderTemplate(UX_GENERALIST.name, UX_GENERALIST.scope);

const ACCESSIBILITY_AUDITOR: Persona = {
  id: "accessibility-auditor",
  name: "Accessibility Auditor",
  scope: [
    "WCAG color contrast between text and its background",
    "any other clearly visible accessibility barrier (missing alt text indicators, unreadable font sizes)",
  ],
  systemPromptTemplate: "",
  defaultModelPreference: { provider: "openrouter", model: "google/gemini-2.0-flash-001" },
  usesContrastChecker: true,
};
ACCESSIBILITY_AUDITOR.systemPromptTemplate =
  renderTemplate(ACCESSIBILITY_AUDITOR.name, ACCESSIBILITY_AUDITOR.scope) +
  `\n[GROUND TRUTH] A deterministic contrast checker has already computed the exact WCAG contrast
ratio for the most visually distinct foreground/background pair in this frame. It is provided in
the "deterministicFindings" field of this request. Narrate and explain this finding rather than
estimating your own contrast ratio — only add a NEW critique if you spot an additional, different
contrast issue elsewhere on screen.`;

export const PERSONAS: Record<string, Persona> = {
  [UX_GENERALIST.id]: UX_GENERALIST,
  [ACCESSIBILITY_AUDITOR.id]: ACCESSIBILITY_AUDITOR,
};

export function getPersona(id: string): Persona {
  const persona = PERSONAS[id];
  if (!persona) throw new Error(`Unknown persona: ${id}`);
  return persona;
}
