import type { ModelPreference } from "../schema/critique.js";

/** User-facing cost/latency vs quality toggle (plan §2.3 item 5, §4). Council mode is layered on top in Phase 3. */
export type AnalysisMode = "fast" | "quality";

export interface Persona {
  id: string;
  name: string;
  /** Scope bullets describing what this persona is allowed to comment on. */
  scope: string[];
  systemPromptTemplate: string;
  /** Preferred provider+model per mode; the router tries these before falling back. */
  modelPreferenceByMode: Record<AnalysisMode, ModelPreference>;
  /** True if this persona should run the deterministic contrast checker before the LLM call. */
  usesContrastChecker: boolean;
}
