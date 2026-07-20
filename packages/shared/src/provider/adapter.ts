import type { UxAnalysisRequest, UxAnalysisResponse } from "../schema/critique.js";

export type ProviderId = "openai" | "anthropic" | "gemini" | "openrouter";

export interface ProviderCredentials {
  apiKey: string;
}

export interface RealtimeSessionConfig {
  personaId: string;
  modelPreference: { provider: ProviderId; model: string };
}

/** Placeholder for Phase 2/3 native speech-to-speech sessions; unused in Phase 1. */
export interface RealtimeHandle {
  close(): void;
}

/**
 * Every provider (OpenAI, Anthropic, Gemini, OpenRouter) implements this same
 * interface so the Provider Router can call any of them interchangeably.
 * Phase 1 only registers the OpenRouter adapter.
 */
export interface ProviderAdapter {
  id: ProviderId;
  supportsVision(): boolean;
  supportsNativeRealtimeAudio(): boolean;
  supportsStructuredOutput(): boolean;
  analyzeFrame(
    req: UxAnalysisRequest,
    credentials: ProviderCredentials
  ): Promise<UxAnalysisResponse>;
  streamRealtime?(
    session: RealtimeSessionConfig,
    credentials: ProviderCredentials
  ): RealtimeHandle;
}
