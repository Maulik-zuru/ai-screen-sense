import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildTestRequest, sampleCritique } from "./fixtures.js";

const createMock = vi.fn();

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: createMock } };
  },
}));

const { openaiAdapter } = await import("../openai.js");

beforeEach(() => {
  createMock.mockReset();
});

describe("openaiAdapter", () => {
  it("parses a valid structured-output response into critiques", async () => {
    const critique = sampleCritique();
    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ critiques: [critique] }) } }],
      usage: { prompt_tokens: 100, completion_tokens: 20 },
    });

    const result = await openaiAdapter.analyzeFrame(buildTestRequest(), { apiKey: "sk-test" });

    expect(result.critiques).toEqual([critique]);
    expect(result.rawProviderMeta.provider).toBe("openai");
    expect(result.rawProviderMeta.model).toBe("gpt-4o");
    expect(result.rawProviderMeta.tokensIn).toBe(100);
    expect(result.rawProviderMeta.tokensOut).toBe(20);
  });

  it("requests json_schema structured output with the shared critique schema", async () => {
    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ critiques: [] }) } }],
      usage: {},
    });

    await openaiAdapter.analyzeFrame(buildTestRequest(), { apiKey: "sk-test" });

    const call = createMock.mock.calls.at(-1)?.[0];
    expect(call.response_format.type).toBe("json_schema");
    expect(call.response_format.json_schema.strict).toBe(true);
    expect(call.model).toBe("gpt-4o");
  });

  it("retries once and then throws when every attempt returns invalid JSON", async () => {
    createMock.mockResolvedValue({
      choices: [{ message: { content: "not json" } }],
      usage: {},
    });

    await expect(
      openaiAdapter.analyzeFrame(buildTestRequest(), { apiKey: "sk-test" })
    ).rejects.toThrow(/failed schema validation after retry/);

    expect(createMock).toHaveBeenCalledTimes(2);
  });

  it("recovers if the first attempt fails schema validation but the retry succeeds", async () => {
    const critique = sampleCritique();
    createMock
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ notCritiques: [] }) } }],
        usage: {},
      })
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ critiques: [critique] }) } }],
        usage: {},
      });

    const result = await openaiAdapter.analyzeFrame(buildTestRequest(), { apiKey: "sk-test" });

    expect(result.critiques).toEqual([critique]);
    expect(createMock).toHaveBeenCalledTimes(2);
  });
});
