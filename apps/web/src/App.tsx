import { useCallback, useEffect, useState } from "react";
import { fetchKeyStatus, fetchPersonas, type PersonaSummary } from "./api.js";
import { useScreenCapture, type CapturedFrame } from "./capture/useScreenCapture.js";
import { useSessionSocket } from "./session/useSessionSocket.js";
import { useSpeechPlayback } from "./voice/useSpeechPlayback.js";
import { Settings } from "./components/Settings.js";
import { TranscriptFeed } from "./components/TranscriptFeed.js";

type AnalysisMode = "fast" | "quality";

export function App() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [personaId, setPersonaId] = useState<string>("");
  const [hasKey, setHasKey] = useState(false);
  const [mode, setMode] = useState<AnalysisMode>("fast");

  const speech = useSpeechPlayback();

  const { connect, disconnect, sendFrame, critiques, error, sessionId } = useSessionSocket({
    onCritiques: (batch) => batch.forEach((c) => speech.enqueue(c)),
  });

  const handleFrame = useCallback(
    (frame: CapturedFrame) => {
      if (personaId) sendFrame(personaId, frame, mode);
    },
    [personaId, mode, sendFrame]
  );

  const { start, stop, isCapturing, framesSampled, framesSent } = useScreenCapture({
    onFrame: handleFrame,
  });

  const refreshKeyStatus = useCallback(() => {
    fetchKeyStatus().then((status) => setHasKey(Object.values(status).some(Boolean)));
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
    speech.clear();
  }

  function setSpeechEnabled(value: boolean) {
    speech.setEnabled(value);
    if (!value) speech.clear();
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
        <label>
          Mode
          <select value={mode} onChange={(e) => setMode(e.target.value as AnalysisMode)}>
            <option value="fast">Fast &amp; cheap</option>
            <option value="quality">Best quality</option>
          </select>
        </label>
        {speech.supported && (
          <label>
            <input
              type="checkbox"
              checked={speech.enabled}
              onChange={(e) => setSpeechEnabled(e.target.checked)}
            />
            Speak critiques aloud
          </label>
        )}
        <div>
          {!isCapturing ? (
            <button onClick={handleStart} disabled={!hasKey || !personaId}>
              Start session
            </button>
          ) : (
            <button onClick={handleStop}>Stop session</button>
          )}
        </div>
        {!hasKey && <p>Configure and save at least one provider key above before starting a session.</p>}
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
