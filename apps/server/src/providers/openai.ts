import OpenAI from "openai";
import {
  CRITIQUE_JSON_SCHEMA,
  CritiqueListSchema,
  type ProviderAdapter,
  type ProviderCredentials,
  type UxAnalysisRequest,
  type UxAnalysisResponse,
} from "@ai-screen-sense/shared";
import { buildContextText } from "./shared.js";

function buildUserContent(req: UxAnalysisRequest) {
  return [
    { type: "text" as const, text: buildContextText(req) },
    {
      type: "image_url" as const,
      image_url: { url: `data:${req.frame.mimeType};base64,${req.frame.imageBase64}` },
    },
  ];
}

async function callOnce(client: OpenAI, req: UxAnalysisRequest) {
  const completion = await client.chat.completions.create({
    model: req.modelPreferenceChain[0].model,
    messages: [
      { role: "system", content: req.systemPrompt },
      { role: "user", content: buildUserContent(req) },
    ],
    temperature: 0.2,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "emit_critiques",
        strict: true,
        schema: CRITIQUE_JSON_SCHEMA,
      },
    },
  });

  const text = completion.choices[0]?.message?.content ?? "";
  return {
    raw: JSON.parse(text),
    tokensIn: completion.usage?.prompt_tokens,
    tokensOut: completion.usage?.completion_tokens,
  };
}

export const openaiAdapter: ProviderAdapter = {
  id: "openai",
  supportsVision: () => true,
  supportsNativeRealtimeAudio: () => true,
  supportsStructuredOutput: () => true,

  async analyzeFrame(
    req: UxAnalysisRequest,
    credentials: ProviderCredentials
  ): Promise<UxAnalysisResponse> {
    const client = new OpenAI({ apiKey: credentials.apiKey });

    const start = Date.now();
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { raw, tokensIn, tokensOut } = await callOnce(client, req);
        const parsed = CritiqueListSchema.parse(raw);
        return {
          critiques: parsed.critiques,
          rawProviderMeta: {
            provider: "openai",
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

    throw new Error(`OpenAI response failed schema validation after retry: ${String(lastError)}`);
  },
};
