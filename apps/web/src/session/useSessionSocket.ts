import { useCallback, useEffect, useRef, useState } from "react";
import type { Critique } from "@ai-screen-sense/shared";
import type { CapturedFrame } from "../capture/useScreenCapture.js";

type ServerMessage =
  | { type: "session_started"; sessionId: string }
  | { type: "critiques"; critiques: Critique[] }
  | { type: "error"; message: string };

export function useSessionSocket() {
  const [critiques, setCritiques] = useState<Critique[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/api/sessions/stream`);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const message: ServerMessage = JSON.parse(event.data);
      if (message.type === "session_started") setSessionId(message.sessionId);
      if (message.type === "critiques") setCritiques((prev) => [...prev, ...message.critiques]);
      if (message.type === "error") setError(message.message);
    };
    ws.onclose = () => {
      wsRef.current = null;
    };
    return ws;
  }, []);

  const sendFrame = useCallback((personaId: string, frame: CapturedFrame) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "frame", personaId, frame }));
    }
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setSessionId(null);
  }, []);

  useEffect(() => () => wsRef.current?.close(), []);

  return { connect, disconnect, sendFrame, critiques, error, sessionId };
}
