import Anthropic from "@anthropic-ai/sdk";
import {
  CRITIQUE_JSON_SCHEMA,
  CritiqueListSchema,
  type ProviderAdapter,
  type ProviderCredentials,
  type UxAnalysisRequest,
  type UxAnalysisResponse,
} from "@ai-screen-sense/shared";
import { buildContextText } from "./shared.js";

const EMIT_CRITIQUES_TOOL = "emit_critiques";

function toAnthropicMediaType(mimeType: string): "image/jpeg" | "image/png" | "image/webp" {
  if (mimeType === "image/png" || mimeType === "image/webp") return mimeType;
  return "image/jpeg";
}

async function callOnce(client: Anthropic, req: UxAnalysisRequest) {
  const message = await client.messages.create({
    model: req.modelPreferenceChain[0].model,
    max_tokens: 4096,
    system: req.systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: buildContextText(req) },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: toAnthropicMediaType(req.frame.mimeType),
              data: req.frame.imageBase64,
            },
          },
        ],
      },
    ],
    tools: [
      {
        name: EMIT_CRITIQUES_TOOL,
        description: "Emit the structured UX critiques found in this frame.",
        input_schema: CRITIQUE_JSON_SCHEMA as unknown as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: EMIT_CRITIQUES_TOOL },
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("Anthropic response did not include the forced emit_critiques tool call");
  }

  return {
    raw: toolUse.input,
    tokensIn: message.usage.input_tokens,
    tokensOut: message.usage.output_tokens,
  };
}

export const anthropicAdapter: ProviderAdapter = {
  id: "anthropic",
  supportsVision: () => true,
  supportsNativeRealtimeAudio: () => false,
  supportsStructuredOutput: () => true,

  async analyzeFrame(
    req: UxAnalysisRequest,
    credentials: ProviderCredentials
  ): Promise<UxAnalysisResponse> {
    const client = new Anthropic({ apiKey: credentials.apiKey });

    const start = Date.now();
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { raw, tokensIn, tokensOut } = await callOnce(client, req);
        const parsed = CritiqueListSchema.parse(raw);
        return {
          critiques: parsed.critiques,
          rawProviderMeta: {
            provider: "anthropic",
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

    throw new Error(
      `Anthropic response failed schema validation after retry: ${String(lastError)}`
    );
  },
};
