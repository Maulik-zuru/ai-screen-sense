import type { ModelPreference } from "../schema/critique.js";

export interface Persona {
  id: string;
  name: string;
  /** Scope bullets describing what this persona is allowed to comment on. */
  scope: string[];
  systemPromptTemplate: string;
  defaultModelPreference: ModelPreference;
  /** True if this persona should run the deterministic contrast checker before the LLM call. */
  usesContrastChecker: boolean;
}
