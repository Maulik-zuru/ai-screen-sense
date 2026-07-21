import { describe, expect, it } from "vitest";
import { PERSONAS, getPersona, buildModelPreferenceChain } from "../registry.js";

describe("persona registry", () => {
  it("registers all 8 personas from the plan (original 6 + 2 differentiators)", () => {
    expect(Object.keys(PERSONAS).sort()).toEqual(
      [
        "accessibility-auditor",
        "code-quality-reviewer",
        "conversion-optimiser",
        "design-purist",
        "founders-eye",
        "localization-auditor",
        "mobile-critic",
        "ux-generalist",
      ].sort()
    );
  });

  it("throws for an unknown persona id", () => {
    expect(() => getPersona("does-not-exist")).toThrow(/Unknown persona/);
  });

  it("puts the mode-preferred model first in the fallback chain", () => {
    const persona = getPersona("conversion-optimiser");
    const chain = buildModelPreferenceChain(persona, "quality");
    expect(chain[0]).toEqual(persona.modelPreferenceByMode.quality);
  });

  it("does not duplicate the preferred model in the fallback tail", () => {
    const persona = getPersona("accessibility-auditor");
    const chain = buildModelPreferenceChain(persona, "fast");
    const preferred = persona.modelPreferenceByMode.fast;
    const duplicates = chain.filter(
      (m) => m.provider === preferred.provider && m.model === preferred.model
    );
    expect(duplicates).toHaveLength(1);
  });
});
