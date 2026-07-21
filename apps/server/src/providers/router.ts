import type { ModelPreference, ProviderAdapter, ProviderId, UxAnalysisRequest, UxAnalysisResponse } from "@ai-screen-sense/shared";
import { openRouterAdapter } from "./openrouter.js";
import { openaiAdapter } from "./openai.js";
import { anthropicAdapter } from "./anthropic.js";
import { geminiAdapter } from "./gemini.js";
import { getProviderKey } from "../keys/store.js";

const ADAPTERS: Record<ProviderId, ProviderAdapter> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  gemini: geminiAdapter,
  openrouter: openRouterAdapter,
};

export class NoConfiguredProviderError extends Error {
  constructor(chain: ModelPreference[]) {
    super(
      `No API key configured for any provider in the fallback chain: ${chain
        .map((m) => m.provider)
        .join(", ")}`
    );
    this.name = "NoConfiguredProviderError";
  }
}

/**
 * Tries each entry in the request's modelPreferenceChain in order (plan §2.3
 * item 4): skips providers the user hasn't configured a key for, and falls
 * back to the next entry if a configured provider's call throws (rate limit,
 * timeout, moderation block, schema-validation failure after its own retry).
 */
export async function routeAnalysis(req: UxAnalysisRequest): Promise<UxAnalysisResponse> {
  let lastError: unknown;

  for (const modelPreference of req.modelPreferenceChain) {
    const apiKey = await getProviderKey(modelPreference.provider);
    if (!apiKey) continue;

    const adapter = ADAPTERS[modelPreference.provider];
    try {
      return await adapter.analyzeFrame({ ...req, modelPreferenceChain: [modelPreference] }, { apiKey });
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) {
    throw new Error(
      `All providers in the fallback chain failed; last error: ${String(lastError)}`
    );
  }
  throw new NoConfiguredProviderError(req.modelPreferenceChain);
}
