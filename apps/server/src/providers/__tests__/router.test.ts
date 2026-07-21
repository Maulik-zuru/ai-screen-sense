import { describe, expect, it, vi, beforeEach } from "vitest";
import { buildTestRequest, sampleCritique } from "./fixtures.js";

const getProviderKeyMock = vi.fn();
const openaiAnalyzeMock = vi.fn();
const anthropicAnalyzeMock = vi.fn();
const geminiAnalyzeMock = vi.fn();
const openrouterAnalyzeMock = vi.fn();

vi.mock("../../keys/store.js", () => ({
  getProviderKey: getProviderKeyMock,
}));
vi.mock("../openai.js", () => ({
  openaiAdapter: { id: "openai", analyzeFrame: openaiAnalyzeMock },
}));
vi.mock("../anthropic.js", () => ({
  anthropicAdapter: { id: "anthropic", analyzeFrame: anthropicAnalyzeMock },
}));
vi.mock("../gemini.js", () => ({
  geminiAdapter: { id: "gemini", analyzeFrame: geminiAnalyzeMock },
}));
vi.mock("../openrouter.js", () => ({
  openRouterAdapter: { id: "openrouter", analyzeFrame: openrouterAnalyzeMock },
}));

const { routeAnalysis, NoConfiguredProviderError } = await import("../router.js");

function response(provider: string) {
  return {
    critiques: [sampleCritique()],
    rawProviderMeta: { provider, model: "m", latencyMs: 1 },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("routeAnalysis", () => {
  it("uses the first provider in the chain when its key is configured", async () => {
    getProviderKeyMock.mockImplementation(async (provider: string) =>
      provider === "openai" ? "sk-test" : null
    );
    openaiAnalyzeMock.mockResolvedValueOnce(response("openai"));

    const req = buildTestRequest({
      modelPreferenceChain: [
        { provider: "openai", model: "gpt-4o" },
        { provider: "gemini", model: "gemini-2.0-flash" },
      ],
    });

    const result = await routeAnalysis(req);

    expect(result.rawProviderMeta.provider).toBe("openai");
    expect(openaiAnalyzeMock).toHaveBeenCalledTimes(1);
    expect(geminiAnalyzeMock).not.toHaveBeenCalled();
  });

  it("skips providers with no configured key and falls through to the next entry", async () => {
    getProviderKeyMock.mockImplementation(async (provider: string) =>
      provider === "gemini" ? "AIza-test" : null
    );
    geminiAnalyzeMock.mockResolvedValueOnce(response("gemini"));

    const req = buildTestRequest({
      modelPreferenceChain: [
        { provider: "openai", model: "gpt-4o" },
        { provider: "anthropic", model: "claude-sonnet-4-5" },
        { provider: "gemini", model: "gemini-2.0-flash" },
      ],
    });

    const result = await routeAnalysis(req);

    expect(result.rawProviderMeta.provider).toBe("gemini");
    expect(openaiAnalyzeMock).not.toHaveBeenCalled();
    expect(anthropicAnalyzeMock).not.toHaveBeenCalled();
  });

  it("falls back to the next configured provider when the preferred one throws", async () => {
    getProviderKeyMock.mockImplementation(async () => "some-key");
    openaiAnalyzeMock.mockRejectedValueOnce(new Error("rate limited"));
    anthropicAnalyzeMock.mockResolvedValueOnce(response("anthropic"));

    const req = buildTestRequest({
      modelPreferenceChain: [
        { provider: "openai", model: "gpt-4o" },
        { provider: "anthropic", model: "claude-sonnet-4-5" },
      ],
    });

    const result = await routeAnalysis(req);

    expect(result.rawProviderMeta.provider).toBe("anthropic");
    expect(openaiAnalyzeMock).toHaveBeenCalledTimes(1);
    expect(anthropicAnalyzeMock).toHaveBeenCalledTimes(1);
  });

  it("throws NoConfiguredProviderError when no provider in the chain has a key", async () => {
    getProviderKeyMock.mockResolvedValue(null);

    const req = buildTestRequest({
      modelPreferenceChain: [
        { provider: "openai", model: "gpt-4o" },
        { provider: "gemini", model: "gemini-2.0-flash" },
      ],
    });

    await expect(routeAnalysis(req)).rejects.toThrow(NoConfiguredProviderError);
  });

  it("throws a descriptive error when every configured provider in the chain fails", async () => {
    getProviderKeyMock.mockResolvedValue("some-key");
    openaiAnalyzeMock.mockRejectedValueOnce(new Error("rate limited"));
    anthropicAnalyzeMock.mockRejectedValueOnce(new Error("moderation block"));

    const req = buildTestRequest({
      modelPreferenceChain: [
        { provider: "openai", model: "gpt-4o" },
        { provider: "anthropic", model: "claude-sonnet-4-5" },
      ],
    });

    await expect(routeAnalysis(req)).rejects.toThrow(/All providers in the fallback chain failed/);
  });
});
