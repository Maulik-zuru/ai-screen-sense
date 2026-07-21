import type { AnalysisMode, ModelPreference, Persona } from "@ai-screen-sense/shared";

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

function definePersona(input: {
  id: string;
  name: string;
  scope: string[];
  modelPreferenceByMode: Record<AnalysisMode, ModelPreference>;
  usesContrastChecker?: boolean;
  extraPromptSuffix?: string;
}): Persona {
  const systemPromptTemplate =
    renderTemplate(input.name, input.scope) + (input.extraPromptSuffix ?? "");
  return {
    id: input.id,
    name: input.name,
    scope: input.scope,
    systemPromptTemplate,
    modelPreferenceByMode: input.modelPreferenceByMode,
    usesContrastChecker: input.usesContrastChecker ?? false,
  };
}

const GEMINI_FLASH: ModelPreference = { provider: "gemini", model: "gemini-2.0-flash" };
const GEMINI_FLASH_OR: ModelPreference = { provider: "openrouter", model: "google/gemini-2.0-flash-001" };
const GPT_QUALITY: ModelPreference = { provider: "openai", model: "gpt-4o" };
const GPT_MINI_OR: ModelPreference = { provider: "openrouter", model: "openai/gpt-4o-mini" };
const CLAUDE_QUALITY: ModelPreference = { provider: "anthropic", model: "claude-sonnet-4-5" };

const CONTRAST_GROUND_TRUTH_SUFFIX = `
[GROUND TRUTH] A deterministic contrast checker has already computed the exact WCAG contrast
ratio for the most visually distinct foreground/background pair in this frame. It is provided in
the "deterministicFindings" field of this request. Narrate and explain this finding rather than
estimating your own contrast ratio — only add a NEW critique if you spot an additional, different
contrast issue elsewhere on screen.`;

const REGISTRY: Persona[] = [
  definePersona({
    id: "ux-generalist",
    name: "UX Generalist",
    scope: [
      "overall layout clarity and visual hierarchy",
      "navigation and information architecture",
      "consistency of interactive patterns across the screen",
    ],
    modelPreferenceByMode: { quality: GPT_QUALITY, fast: GEMINI_FLASH },
  }),
  definePersona({
    id: "accessibility-auditor",
    name: "Accessibility Auditor",
    scope: [
      "WCAG color contrast between text and its background",
      "any other clearly visible accessibility barrier (missing alt text indicators, unreadable font sizes)",
    ],
    modelPreferenceByMode: { quality: GEMINI_FLASH, fast: GEMINI_FLASH },
    usesContrastChecker: true,
    extraPromptSuffix: CONTRAST_GROUND_TRUTH_SUFFIX,
  }),
  definePersona({
    id: "design-purist",
    name: "Design Purist",
    scope: [
      "pixel-level alignment and grid consistency",
      "typographic scale and font-weight consistency",
      "precise spacing/padding deviations from the dominant unit",
    ],
    modelPreferenceByMode: { quality: CLAUDE_QUALITY, fast: GEMINI_FLASH },
  }),
  definePersona({
    id: "conversion-optimiser",
    name: "Conversion Optimiser",
    scope: [
      "call-to-action clarity, prominence, and persuasive copy",
      "friction points in the visible conversion path",
      "trust signals (social proof, guarantees, pricing clarity)",
    ],
    modelPreferenceByMode: { quality: CLAUDE_QUALITY, fast: GPT_MINI_OR },
  }),
  definePersona({
    id: "mobile-critic",
    name: "Mobile Critic",
    scope: [
      "tap-target sizing against 44x44 (iOS) / 48x48 (Material) minimums",
      "layout behavior at small viewport widths",
      "thumb-reachability of primary actions",
    ],
    modelPreferenceByMode: { quality: GEMINI_FLASH, fast: GEMINI_FLASH },
  }),
  definePersona({
    id: "founders-eye",
    name: "Founder's Eye",
    scope: [
      "whether a first-time visitor immediately understands what this product does",
      "overall positioning and clarity of the value proposition",
      "anything that would make a skeptical user bounce in the first 5 seconds",
    ],
    modelPreferenceByMode: { quality: CLAUDE_QUALITY, fast: GEMINI_FLASH },
  }),
  definePersona({
    id: "code-quality-reviewer",
    name: "Code Quality Reviewer",
    scope: [
      "anti-patterns or bugs visible in any on-screen source/dev-tools panel",
      "obviously incorrect or unsafe code visible on screen (not the visual UI)",
    ],
    modelPreferenceByMode: { quality: CLAUDE_QUALITY, fast: GPT_MINI_OR },
  }),
  definePersona({
    id: "localization-auditor",
    name: "Localization/i18n Auditor",
    scope: [
      "hardcoded strings that appear to bypass a translation layer",
      "text truncation/overflow risk if this string were 30% longer (for longer languages)",
      "RTL-layout issues (mirrored icons, broken alignment)",
    ],
    modelPreferenceByMode: { quality: GPT_QUALITY, fast: GEMINI_FLASH },
  }),
];

export const PERSONAS: Record<string, Persona> = Object.fromEntries(
  REGISTRY.map((p) => [p.id, p])
);

export function getPersona(id: string): Persona {
  const persona = PERSONAS[id];
  if (!persona) throw new Error(`Unknown persona: ${id}`);
  return persona;
}

/**
 * The mode-preferred provider goes first; the rest of the configured
 * providers (deduped, mode-preferred's own model excluded) follow as the
 * fallback chain (plan §2.3 item 4) using each provider's OpenRouter-routed
 * equivalent model where we don't have a first-party pick for that persona.
 */
export function buildModelPreferenceChain(persona: Persona, mode: AnalysisMode): ModelPreference[] {
  const preferred = persona.modelPreferenceByMode[mode];
  const fallbacks = [GEMINI_FLASH_OR, GPT_MINI_OR].filter(
    (m) => !(m.provider === preferred.provider && m.model === preferred.model)
  );
  return [preferred, ...fallbacks];
}
