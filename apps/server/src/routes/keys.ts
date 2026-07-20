import { Router, type Router as RouterType } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { getProviderKey, hasProviderKey, saveProviderKey } from "../keys/store.js";
import { asyncHandler } from "./asyncHandler.js";

export const keysRouter: RouterType = Router();

const SUPPORTED_PROVIDERS = ["openrouter"] as const;

const SaveKeyBody = z.object({ apiKey: z.string().min(1) });

function assertSupported(provider: string) {
  if (!SUPPORTED_PROVIDERS.includes(provider as (typeof SUPPORTED_PROVIDERS)[number])) {
    throw Object.assign(new Error(`Provider "${provider}" is not supported in Phase 1`), {
      status: 400,
    });
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

    const client = new OpenAI({ apiKey, baseURL: "https://openrouter.ai/api/v1" });
    await client.models.list();
    res.json({ ok: true });
  })
);
