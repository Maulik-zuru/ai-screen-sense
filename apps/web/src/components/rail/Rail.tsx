import type { PersonaSummary } from "../../api.js";
import { Button } from "../ui/Button.js";
import { Segmented } from "../ui/Segmented.js";
import { Toggle } from "../ui/Toggle.js";
import { MetricChip } from "../ui/MetricChip.js";
import { PersonaSelect } from "./PersonaSelect.js";
import { ProviderStatusList } from "./ProviderStatusList.js";

type AnalysisMode = "fast" | "quality";

export function Rail({
  personas,
  personaId,
  onPersonaChange,
  mode,
  onModeChange,
  speechSupported,
  speechEnabled,
  onSpeechChange,
  isCapturing,
  hasKey,
  onStart,
  onStop,
  framesSampled,
  framesSent,
  providerStatus,
  onManageKeys,
  error,
}: {
  personas: PersonaSummary[];
  personaId: string;
  onPersonaChange: (id: string) => void;
  mode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  speechSupported: boolean;
  speechEnabled: boolean;
  onSpeechChange: (enabled: boolean) => void;
  isCapturing: boolean;
  hasKey: boolean;
  onStart: () => void;
  onStop: () => void;
  framesSampled: number;
  framesSent: number;
  providerStatus: Record<string, boolean>;
  onManageKeys: () => void;
  error: string | null;
}) {
  const canStart = hasKey && !!personaId;

  return (
    <aside className="flex max-h-[60vh] w-full shrink-0 flex-col gap-6 overflow-y-auto border-b border-border bg-surface p-5 lg:max-h-none lg:w-80 lg:border-b-0 lg:border-r">
      <div className="flex flex-col gap-4">
        <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-text-muted">
          // SESSION
        </span>

        <PersonaSelect
          personas={personas}
          value={personaId}
          onChange={onPersonaChange}
          disabled={isCapturing}
        />

        <Segmented
          options={[
            { value: "fast", label: "Fast" },
            { value: "quality", label: "Quality" },
          ]}
          value={mode}
          onChange={onModeChange}
          disabled={isCapturing}
        />

        {speechSupported && (
          <Toggle
            checked={speechEnabled}
            onChange={onSpeechChange}
            label="Speak critiques aloud"
            sublabel={speechEnabled ? "BROWSER TTS" : undefined}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        {!isCapturing ? (
          <Button onClick={onStart} disabled={!canStart} className="w-full">
            Start session
          </Button>
        ) : (
          <Button onClick={onStop} variant="outline" className="w-full">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-live-ping rounded-full bg-live opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
            </span>
            Stop session
          </Button>
        )}
        {!hasKey && !isCapturing && (
          <p className="text-[13px] text-text-muted">Add a provider key to begin</p>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-crit-surface bg-crit-surface px-3 py-2.5 text-[13px] text-crit-ink">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-text-muted">
          // TELEMETRY
        </span>
        <div className="flex gap-2">
          <MetricChip label="FRAMES" value={isCapturing ? framesSampled : "—"} />
          <MetricChip label="SENT" value={isCapturing ? framesSent : "—"} />
        </div>
      </div>

      <div className="mt-auto border-t border-border pt-5">
        <ProviderStatusList status={providerStatus} onManageKeys={onManageKeys} />
      </div>
    </aside>
  );
}
