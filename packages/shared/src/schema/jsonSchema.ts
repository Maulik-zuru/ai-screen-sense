/**
 * Plain JSON Schema (draft-2020-12-ish, but scoped to what OpenAI/Gemini's
 * structured-output modes accept) for the Critique[] shape defined in
 * critique.ts. Kept as a hand-written literal alongside the Zod schema
 * (rather than derived via zod-to-json-schema) so each provider adapter can
 * pass exactly the subset of keywords its structured-output mode supports.
 */
export const CRITIQUE_JSON_SCHEMA = {
  type: "object",
  properties: {
    critiques: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          personaId: { type: "string" },
          severity: { type: "string", enum: ["info", "warning", "critical"] },
          spokenText: { type: "string" },
          transcriptText: { type: "string" },
          codeFix: {
            type: "object",
            properties: {
              language: { type: "string" },
              before: { type: "string" },
              after: { type: "string" },
            },
            required: ["language", "after"],
          },
          region: {
            type: "object",
            properties: {
              x: { type: "number" },
              y: { type: "number" },
              width: { type: "number" },
              height: { type: "number" },
            },
            required: ["x", "y", "width", "height"],
          },
          confidence: { type: "number" },
          source: { type: "string", enum: ["llm", "deterministic", "council"] },
        },
        required: [
          "id",
          "personaId",
          "severity",
          "spokenText",
          "transcriptText",
          "confidence",
          "source",
        ],
      },
    },
  },
  required: ["critiques"],
} as const;
