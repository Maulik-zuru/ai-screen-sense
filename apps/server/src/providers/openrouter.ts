import OpenAI from "openai";
import {
  CritiqueListSchema,
  type ProviderAdapter,
  type ProviderCredentials,
  type UxAnalysisRequest,
  type UxAnalysisResponse,
} from "@ai-screen-sense/shared";

const RESPONSE_FORMAT_INSTRUCTION = `Respond with ONLY valid JSON, no markdown fences, no prose,
matching exactly this shape:
{"critiques": [{"id": string, "personaId": string, "severity": "info"|"warning"|"critical",
"spokenText": string, "transcriptText": string, "codeFix"?: {"language": string, "before"?: string,
"after": string}, "region"?: {"x": number, "y": number, "width": number, "height": number},
"confidence": number, "source": "llm"|"deterministic"|"council"}]}`;

function buildUserContent(req: UxAnalysisRequest) {
  const context = [
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

  return [
    { type: "text" as const, text: `${context}\n\n${RESPONSE_FORMAT_INSTRUCTION}` },
    {
      type: "image_url" as const,
      image_url: { url: `data:${req.frame.mimeType};base64,${req.frame.imageBase64}` },
    },
  ];
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  return JSON.parse(candidate.trim());
}

async function callOnce(
  client: OpenAI,
  req: UxAnalysisRequest
): Promise<{ raw: unknown; tokensIn?: number; tokensOut?: number }> {
  const completion = await client.chat.completions.create({
    model: req.modelPreference.model,
    messages: [
      { role: "system", content: req.systemPrompt },
      { role: "user", content: buildUserContent(req) },
    ],
    temperature: 0.2,
  });

  const text = completion.choices[0]?.message?.content ?? "";
  return {
    raw: extractJson(text),
    tokensIn: completion.usage?.prompt_tokens,
    tokensOut: completion.usage?.completion_tokens,
  };
}

export const openRouterAdapter: ProviderAdapter = {
  id: "openrouter",
  supportsVision: () => true,
  supportsNativeRealtimeAudio: () => false,
  supportsStructuredOutput: () => false,

  async analyzeFrame(
    req: UxAnalysisRequest,
    credentials: ProviderCredentials
  ): Promise<UxAnalysisResponse> {
    const client = new OpenAI({
      apiKey: credentials.apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const start = Date.now();
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { raw, tokensIn, tokensOut } = await callOnce(client, req);
        const parsed = CritiqueListSchema.parse(raw);
        return {
          critiques: parsed.critiques,
          rawProviderMeta: {
            provider: "openrouter",
            model: req.modelPreference.model,
            latencyMs: Date.now() - start,
            tokensIn,
            tokensOut,
          },
        };
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(
      `OpenRouter response failed schema validation after retry: ${String(lastError)}`
    );
  },
};
