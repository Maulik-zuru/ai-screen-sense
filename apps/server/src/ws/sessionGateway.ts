import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { randomUUID } from "node:crypto";
import { WebSocketServer, type WebSocket } from "ws";
import { z } from "zod";
import { FrameSchema, type Critique } from "@ai-screen-sense/shared";
import { getPersona, buildModelPreferenceChain } from "../personas/registry.js";
import { checkContrast } from "../analyzers/contrast.js";
import { routeAnalysis } from "../providers/router.js";
import { createSession, endSession, getRecentTranscripts, saveCritique } from "../sessions/store.js";

const ClientFrameMessage = z.object({
  type: z.literal("frame"),
  personaId: z.string(),
  frame: FrameSchema,
  mode: z.enum(["fast", "quality"]).default("fast"),
});

const ClientMessage = ClientFrameMessage;

type ServerMessage =
  | { type: "session_started"; sessionId: string }
  | { type: "critiques"; critiques: Critique[] }
  | { type: "error"; message: string };

function send(ws: WebSocket, message: ServerMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

export function createSessionGateway() {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket) => {
    let sessionId: string | null = null;
    let processing = false;

    ws.on("message", async (raw) => {
      let parsed: z.infer<typeof ClientMessage>;
      try {
        parsed = ClientMessage.parse(JSON.parse(raw.toString()));
      } catch {
        send(ws, { type: "error", message: "Malformed client message" });
        return;
      }

      if (!sessionId) {
        sessionId = await createSession([parsed.personaId]);
        send(ws, { type: "session_started", sessionId });
      }

      // Drop frames while a prior analysis is in flight rather than queuing —
      // the client's own frame-diff throttling means this should be rare, and
      // it keeps the LLM call rate bounded to the user's own BYOK spend.
      if (processing) return;
      processing = true;

      try {
        const persona = getPersona(parsed.personaId);
        const imageBuffer = Buffer.from(parsed.frame.imageBase64, "base64");

        const deterministicFindings = persona.usesContrastChecker
          ? [
              await checkContrast(imageBuffer, {
                x: 0,
                y: 0,
                width: parsed.frame.width,
                height: parsed.frame.height,
              }),
            ]
          : [];

        const priorCritiques = await getRecentTranscripts(sessionId, persona.id);

        const response = await routeAnalysis({
          personaId: persona.id,
          systemPrompt: persona.systemPromptTemplate,
          frame: parsed.frame,
          deterministicFindings,
          priorCritiques,
          modelPreferenceChain: buildModelPreferenceChain(persona, parsed.mode),
        });

        for (const critique of response.critiques) {
          const withId: Critique = { ...critique, id: critique.id || randomUUID() };
          await saveCritique(sessionId, withId);
        }

        if (response.critiques.length > 0) {
          send(ws, { type: "critiques", critiques: response.critiques });
        }
      } catch (err) {
        send(ws, { type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        processing = false;
      }
    });

    ws.on("close", async () => {
      if (sessionId) {
        await endSession(sessionId);
      }
    });
  });

  return {
    handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    },
  };
}
