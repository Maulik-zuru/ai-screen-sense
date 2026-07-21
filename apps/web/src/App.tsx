import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchKeyStatus, fetchPersonas, type PersonaSummary } from "./api.js";
import { useScreenCapture, type CapturedFrame } from "./capture/useScreenCapture.js";
import { useSessionSocket } from "./session/useSessionSocket.js";
import { useSpeechPlayback } from "./voice/useSpeechPlayback.js";
import { TopBar } from "./components/layout/TopBar.js";
import { Rail } from "./components/rail/Rail.js";
import { TranscriptPanel, type CritiqueEntry } from "./components/transcript/TranscriptPanel.js";
import { SettingsModal } from "./components/settings/SettingsModal.js";
import type { EmptyStateVariant } from "./components/transcript/EmptyState.js";

type AnalysisMode = "fast" | "quality";

function useElapsedTimer(active: boolean): string {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      startRef.current = null;
      setElapsed(0);
      return;
    }
    startRef.current = Date.now();
    const id = setInterval(() => {
      setElapsed(Date.now() - (startRef.current ?? Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  const totalSeconds = Math.floor(elapsed / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function App() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [personaId, setPersonaId] = useState<string>("");
  const [providerStatus, setProviderStatus] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<AnalysisMode>("fast");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const receivedAtRef = useRef<Map<string, number>>(new Map());

  const hasKey = Object.values(providerStatus).some(Boolean);

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

  const elapsed = useElapsedTimer(isCapturing);

  const refreshKeyStatus = useCallback(() => {
    fetchKeyStatus()
      .then((status) => setProviderStatus(status ?? {}))
      .catch(() => setProviderStatus({}));
  }, []);

  useEffect(() => {
    fetchPersonas()
      .then((list) => {
        setPersonas(list);
        if (list.length > 0) setPersonaId(list[0].id);
      })
      .catch(() => setPersonas([]));
    refreshKeyStatus();
  }, [refreshKeyStatus]);

  useEffect(() => {
    if (!hasKey) setSettingsOpen(false);
  }, [hasKey]);

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

  const personaNameById = useMemo(
    () => new Map(personas.map((p) => [p.id, p.name])),
    [personas]
  );

  const entries: CritiqueEntry[] = useMemo(() => {
    const map = receivedAtRef.current;
    return critiques.map((critique) => {
      if (!map.has(critique.id)) map.set(critique.id, Date.now());
      return {
        critique,
        personaName: personaNameById.get(critique.personaId) ?? critique.personaId,
        receivedAt: map.get(critique.id)!,
      };
    });
  }, [critiques, personaNameById]);

  const emptyVariant: EmptyStateVariant = !hasKey ? "no-keys" : isCapturing ? "listening" : "ready";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <TopBar
        isCapturing={isCapturing}
        sessionId={sessionId}
        elapsed={elapsed}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <Rail
          personas={personas}
          personaId={personaId}
          onPersonaChange={setPersonaId}
          mode={mode}
          onModeChange={setMode}
          speechSupported={speech.supported}
          speechEnabled={speech.enabled}
          onSpeechChange={setSpeechEnabled}
          isCapturing={isCapturing}
          hasKey={hasKey}
          onStart={handleStart}
          onStop={handleStop}
          framesSampled={framesSampled}
          framesSent={framesSent}
          providerStatus={providerStatus}
          onManageKeys={() => setSettingsOpen(true)}
          error={error}
        />

        <main className="min-h-0 flex-1 overflow-hidden">
          <TranscriptPanel
            entries={entries}
            isCapturing={isCapturing}
            emptyVariant={emptyVariant}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </main>
      </div>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        providerStatus={providerStatus}
        onKeySaved={refreshKeyStatus}
      />
    </div>
  );
}
