import { Router, type Router as RouterType } from "express";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { ProviderId } from "@ai-screen-sense/shared";
import { getProviderKey, hasProviderKey, saveProviderKey } from "../keys/store.js";
import { asyncHandler } from "./asyncHandler.js";

export const keysRouter: RouterType = Router();

const SUPPORTED_PROVIDERS: ProviderId[] = ["openai", "anthropic", "gemini", "openrouter"];

const SaveKeyBody = z.object({ apiKey: z.string().min(1) });

function assertSupported(provider: string): asserts provider is ProviderId {
  if (!SUPPORTED_PROVIDERS.includes(provider as ProviderId)) {
    throw Object.assign(new Error(`Provider "${provider}" is not supported`), {
      status: 400,
    });
  }
}

/** Trivial, cheap call per provider to validate a key (plan §2.4 "Test connection"). */
async function testKey(provider: ProviderId, apiKey: string): Promise<void> {
  switch (provider) {
    case "openai": {
      await new OpenAI({ apiKey }).models.list();
      return;
    }
    case "anthropic": {
      await new Anthropic({ apiKey }).models.list();
      return;
    }
    case "gemini": {
      await new GoogleGenAI({ apiKey }).models.list();
      return;
    }
    case "openrouter": {
      await new OpenAI({ apiKey, baseURL: "https://openrouter.ai/api/v1" }).models.list();
      return;
    }
  }
}

keysRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const status: Record<string, boolean> = {};
    for (const provider of SUPPORTED_PROVIDERS) {
      status[provider] = await hasProviderKey(provider);
    }
    res.json({ providers: status });
  })
);

keysRouter.post(
  "/:provider",
  asyncHandler(async (req, res) => {
    assertSupported(req.params.provider);
    const { apiKey } = SaveKeyBody.parse(req.body);
    await saveProviderKey(req.params.provider, apiKey);
    res.json({ ok: true });
  })
);

keysRouter.post(
  "/:provider/test",
  asyncHandler(async (req, res) => {
    assertSupported(req.params.provider);
    const apiKey = await getProviderKey(req.params.provider);
    if (!apiKey) {
      res.status(404).json({ ok: false, error: "No key configured for this provider" });
      return;
    }

    await testKey(req.params.provider, apiKey);
    res.json({ ok: true });
  })
);
