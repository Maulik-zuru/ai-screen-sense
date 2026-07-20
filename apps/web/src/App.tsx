import { useCallback, useEffect, useState } from "react";
import { fetchKeyStatus, fetchPersonas, type PersonaSummary } from "./api.js";
import { useScreenCapture, type CapturedFrame } from "./capture/useScreenCapture.js";
import { useSessionSocket } from "./session/useSessionSocket.js";
import { Settings } from "./components/Settings.js";
import { TranscriptFeed } from "./components/TranscriptFeed.js";

export function App() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [personaId, setPersonaId] = useState<string>("");
  const [hasKey, setHasKey] = useState(false);

  const { connect, disconnect, sendFrame, critiques, error, sessionId } = useSessionSocket();

  const handleFrame = useCallback(
    (frame: CapturedFrame) => {
      if (personaId) sendFrame(personaId, frame);
    },
    [personaId, sendFrame]
  );

  const { start, stop, isCapturing, framesSampled, framesSent } = useScreenCapture({
    onFrame: handleFrame,
  });

  const refreshKeyStatus = useCallback(() => {
    fetchKeyStatus().then((status) => setHasKey(Boolean(status.openrouter)));
  }, []);

  useEffect(() => {
    fetchPersonas().then((list) => {
      setPersonas(list);
      if (list.length > 0) setPersonaId(list[0].id);
    });
    refreshKeyStatus();
  }, [refreshKeyStatus]);

  async function handleStart() {
    connect();
    await start();
  }

  function handleStop() {
    stop();
    disconnect();
  }

  return (
    <main>
      <h1>AI Screen Sense</h1>
      <Settings onKeySaved={refreshKeyStatus} />

      <section>
        <h2>Session</h2>
        <label>
          Persona
          <select value={personaId} onChange={(e) => setPersonaId(e.target.value)}>
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <div>
          {!isCapturing ? (
            <button onClick={handleStart} disabled={!hasKey || !personaId}>
              Start session
            </button>
          ) : (
            <button onClick={handleStop}>Stop session</button>
          )}
        </div>
        {!hasKey && <p>Configure and save an OpenRouter key above before starting a session.</p>}
        {isCapturing && (
          <p>
            Session {sessionId ?? "(connecting...)"} — frames sampled: {framesSampled}, sent:{" "}
            {framesSent}
          </p>
        )}
        {error && <p role="alert">{error}</p>}
      </section>

      <section>
        <h2>Transcript</h2>
        <TranscriptFeed critiques={critiques} />
      </section>
    </main>
  );
}
