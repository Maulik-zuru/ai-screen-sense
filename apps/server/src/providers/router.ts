import type { ProviderAdapter, ProviderId, UxAnalysisRequest, UxAnalysisResponse } from "@ai-screen-sense/shared";
import { openRouterAdapter } from "./openrouter.js";
import { getProviderKey } from "../keys/store.js";

/**
 * Phase 1 registers a single adapter. Phase 2 adds direct OpenAI/Anthropic/Gemini
 * adapters here plus fallback-chain logic on failure — this router already exists
 * as the seam for that, so adding a provider later doesn't require touching callers.
 */
const ADAPTERS: Partial<Record<ProviderId, ProviderAdapter>> = {
  openrouter: openRouterAdapter,
};

export async function routeAnalysis(req: UxAnalysisRequest): Promise<UxAnalysisResponse> {
  const providerId = req.modelPreference.provider;
  const adapter = ADAPTERS[providerId];
  if (!adapter) {
    throw new Error(`No adapter registered for provider "${providerId}"`);
  }

  const apiKey = await getProviderKey(providerId);
  if (!apiKey) {
    throw new Error(`No API key configured for provider "${providerId}"`);
  }

  return adapter.analyzeFrame(req, { apiKey });
}
