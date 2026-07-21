import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildTestRequest, sampleCritique } from "./fixtures.js";

const createMock = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: createMock };
  },
}));

const { anthropicAdapter } = await import("../anthropic.js");

beforeEach(() => {
  createMock.mockReset();
});

function toolUseResponse(input: unknown) {
  return {
    content: [{ type: "tool_use", id: "t1", name: "emit_critiques", input }],
    usage: { input_tokens: 150, output_tokens: 40 },
  };
}

describe("anthropicAdapter", () => {
  it("parses the forced tool_use block into critiques", async () => {
    const critique = sampleCritique();
    createMock.mockResolvedValueOnce(toolUseResponse({ critiques: [critique] }));

    const result = await anthropicAdapter.analyzeFrame(
      buildTestRequest({ modelPreferenceChain: [{ provider: "anthropic", model: "claude-sonnet-4-5" }] }),
      { apiKey: "sk-ant-test" }
    );

    expect(result.critiques).toEqual([critique]);
    expect(result.rawProviderMeta.provider).toBe("anthropic");
    expect(result.rawProviderMeta.tokensIn).toBe(150);
    expect(result.rawProviderMeta.tokensOut).toBe(40);
  });

  it("forces tool_choice to the emit_critiques tool and sends the frame as a base64 image block", async () => {
    createMock.mockResolvedValueOnce(toolUseResponse({ critiques: [] }));

    await anthropicAdapter.analyzeFrame(buildTestRequest(), { apiKey: "sk-ant-test" });

    const call = createMock.mock.calls.at(-1)?.[0];
    expect(call.tool_choice).toEqual({ type: "tool", name: "emit_critiques" });
    expect(call.tools[0].name).toBe("emit_critiques");
    const imageBlock = call.messages[0].content.find((b: { type: string }) => b.type === "image");
    expect(imageBlock.source.type).toBe("base64");
    expect(imageBlock.source.media_type).toBe("image/jpeg");
  });

  it("throws after retrying when no tool_use block is present in the response", async () => {
    createMock.mockResolvedValue({ content: [{ type: "text", text: "sorry, I can't do that" }] });

    await expect(
      anthropicAdapter.analyzeFrame(buildTestRequest(), { apiKey: "sk-ant-test" })
    ).rejects.toThrow(/failed schema validation after retry/);

    expect(createMock).toHaveBeenCalledTimes(2);
  });
});
