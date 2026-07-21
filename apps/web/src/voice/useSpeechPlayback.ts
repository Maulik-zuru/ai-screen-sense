import { useCallback, useEffect, useRef, useState } from "react";
import type { Critique } from "@ai-screen-sense/shared";

/**
 * Pipeline-fallback voice delivery (plan §7 Path B): browser-native
 * SpeechSynthesis reading each critique's spokenText, zero cost/zero extra
 * key. Queues critiques so a new one doesn't cut off mid-sentence, except a
 * "critical" severity critique interrupts whatever is currently speaking.
 */
export function useSpeechPlayback() {
  const [enabled, setEnabled] = useState(true);
  const queueRef = useRef<Critique[]>([]);
  const speakingRef = useRef(false);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const playNext = useCallback(() => {
    if (speakingRef.current) return;
    const next = queueRef.current.shift();
    if (!next) return;

    speakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(next.spokenText);
    utterance.onend = utterance.onerror = () => {
      speakingRef.current = false;
      playNext();
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const enqueue = useCallback(
    (critique: Critique) => {
      if (!supported || !enabled) return;

      if (critique.severity === "critical") {
        queueRef.current = [];
        window.speechSynthesis.cancel();
        speakingRef.current = false;
      }

      queueRef.current.push(critique);
      playNext();
    },
    [enabled, playNext, supported]
  );

  const clear = useCallback(() => {
    queueRef.current = [];
    speakingRef.current = false;
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  useEffect(() => () => clear(), [clear]);

  return { supported, enabled, setEnabled, enqueue, clear };
}
