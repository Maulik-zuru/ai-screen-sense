import { GoogleGenAI, Type } from "@google/genai";
import {
  CritiqueListSchema,
  type ProviderAdapter,
  type ProviderCredentials,
  type UxAnalysisRequest,
  type UxAnalysisResponse,
} from "@ai-screen-sense/shared";
import { buildContextText } from "./shared.js";

/**
 * Gemini's responseSchema uses its own Type enum rather than plain JSON
 * Schema strings, and (unlike OpenAI/Anthropic) rejects unknown keywords, so
 * this is hand-written rather than reusing CRITIQUE_JSON_SCHEMA verbatim.
 */
const GEMINI_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    critiques: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          personaId: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["info", "warning", "critical"] },
          spokenText: { type: Type.STRING },
          transcriptText: { type: Type.STRING },
          codeFix: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING },
              before: { type: Type.STRING },
              after: { type: Type.STRING },
            },
            required: ["language", "after"],
          },
          region: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              width: { type: Type.NUMBER },
              height: { type: Type.NUMBER },
            },
            required: ["x", "y", "width", "height"],
          },
          confidence: { type: Type.NUMBER },
          source: { type: Type.STRING, enum: ["llm", "deterministic", "council"] },
        },
        required: ["id", "personaId", "severity", "spokenText", "transcriptText", "confidence", "source"],
      },
    },
  },
  required: ["critiques"],
};

async function callOnce(client: GoogleGenAI, req: UxAnalysisRequest) {
  const response = await client.models.generateContent({
    model: req.modelPreferenceChain[0].model,
    contents: [
      {
        role: "user",
        parts: [
          { text: `${req.systemPrompt}\n\n${buildContextText(req)}` },
          { inlineData: { mimeType: req.frame.mimeType, data: req.frame.imageBase64 } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini response contained no text output");

  return {
    raw: JSON.parse(text),
    tokensIn: response.usageMetadata?.promptTokenCount,
    tokensOut: response.usageMetadata?.candidatesTokenCount,
  };
}

export const geminiAdapter: ProviderAdapter = {
  id: "gemini",
  supportsVision: () => true,
  supportsNativeRealtimeAudio: () => true,
  supportsStructuredOutput: () => true,

  async analyzeFrame(
    req: UxAnalysisRequest,
    credentials: ProviderCredentials
  ): Promise<UxAnalysisResponse> {
    const client = new GoogleGenAI({ apiKey: credentials.apiKey });

    const start = Date.now();
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { raw, tokensIn, tokensOut } = await callOnce(client, req);
        const parsed = CritiqueListSchema.parse(raw);
        return {
          critiques: parsed.critiques,
          rawProviderMeta: {
            provider: "gemini",
            model: req.modelPreferenceChain[0].model,
            latencyMs: Date.now() - start,
            tokensIn,
            tokensOut,
          },
        };
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(`Gemini response failed schema validation after retry: ${String(lastError)}`);
  },
};
