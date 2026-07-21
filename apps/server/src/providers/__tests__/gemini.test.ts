import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildTestRequest, sampleCritique } from "./fixtures.js";

const generateContentMock = vi.fn();

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: generateContentMock };
  },
  Type: {
    OBJECT: "OBJECT",
    ARRAY: "ARRAY",
    STRING: "STRING",
    NUMBER: "NUMBER",
  },
}));

const { geminiAdapter } = await import("../gemini.js");

beforeEach(() => {
  generateContentMock.mockReset();
});

describe("geminiAdapter", () => {
  it("parses response.text JSON into critiques", async () => {
    const critique = sampleCritique();
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({ critiques: [critique] }),
      usageMetadata: { promptTokenCount: 200, candidatesTokenCount: 30 },
    });

    const result = await geminiAdapter.analyzeFrame(
      buildTestRequest({ modelPreferenceChain: [{ provider: "gemini", model: "gemini-2.0-flash" }] }),
      { apiKey: "AIza-test" }
    );

    expect(result.critiques).toEqual([critique]);
    expect(result.rawProviderMeta.provider).toBe("gemini");
    expect(result.rawProviderMeta.tokensIn).toBe(200);
    expect(result.rawProviderMeta.tokensOut).toBe(30);
  });

  it("sends responseMimeType application/json and a responseSchema, plus the frame as inlineData", async () => {
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify({ critiques: [] }) });

    await geminiAdapter.analyzeFrame(buildTestRequest(), { apiKey: "AIza-test" });

    const call = generateContentMock.mock.calls.at(-1)?.[0];
    expect(call.config.responseMimeType).toBe("application/json");
    expect(call.config.responseSchema).toBeDefined();
    const imagePart = call.contents[0].parts.find((p: { inlineData?: unknown }) => p.inlineData);
    expect(imagePart.inlineData.mimeType).toBe("image/jpeg");
  });

  it("throws after retrying when response.text is empty", async () => {
    generateContentMock.mockResolvedValue({ text: undefined });

    await expect(
      geminiAdapter.analyzeFrame(buildTestRequest(), { apiKey: "AIza-test" })
    ).rejects.toThrow(/failed schema validation after retry/);

    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });
});
