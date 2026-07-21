export interface PersonaShowcase {
  id: string;
  name: string;
  scope: string[];
  sampleCritique: string;
  severity: "info" | "warning" | "critical";
}

export const PERSONA_SHOWCASE: PersonaShowcase[] = [
  {
    id: "accessibility-auditor",
    name: "Accessibility Auditor",
    scope: ["WCAG contrast ratios", "visible a11y barriers", "readable font sizes"],
    sampleCritique: "Primary CTA fails WCAG AA — 2.8:1 against its background. Needs 4.5:1.",
    severity: "critical",
  },
  {
    id: "ux-generalist",
    name: "UX Generalist",
    scope: ["layout clarity", "navigation & IA", "interaction consistency"],
    sampleCritique: "Nav hierarchy is unclear — three items compete for the same primary weight.",
    severity: "warning",
  },
  {
    id: "design-purist",
    name: "Design Purist",
    scope: ["pixel alignment", "type scale", "spacing deviations"],
    sampleCritique: "Card padding drifts from 16px to 14px between rows — grid isn't locked.",
    severity: "info",
  },
  {
    id: "conversion-optimiser",
    name: "Conversion Optimiser",
    scope: ["CTA clarity", "conversion friction", "trust signals"],
    sampleCritique: "No price shown before checkout step 2 — that's a drop-off point.",
    severity: "warning",
  },
  {
    id: "mobile-critic",
    name: "Mobile Critic",
    scope: ["44×44 tap targets", "small-viewport layout", "thumb reach"],
    sampleCritique: "Tap targets are 32×32px — below the 44px minimum on iOS.",
    severity: "critical",
  },
  {
    id: "founders-eye",
    name: "Founder's Eye",
    scope: ["first-5-seconds clarity", "positioning", "bounce risk"],
    sampleCritique: "A cold visitor can't tell what this does without scrolling past the fold.",
    severity: "info",
  },
];
