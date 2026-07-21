import { AnimatePresence } from "framer-motion";
import type { Critique } from "@ai-screen-sense/shared";
import { CritiqueCard } from "../critique/CritiqueCard.js";
import { EmptyState, type EmptyStateVariant } from "./EmptyState.js";
import { LiveTail } from "./LiveTail.js";

export interface CritiqueEntry {
  critique: Critique;
  personaName: string;
  receivedAt: number;
}

export function TranscriptPanel({
  entries,
  isCapturing,
  emptyVariant,
  onOpenSettings,
}: {
  entries: CritiqueEntry[];
  isCapturing: boolean;
  emptyVariant: EmptyStateVariant;
  onOpenSettings: () => void;
}) {
  const newestFirst = [...entries].reverse();

  return (
    <div className="dot-grid flex h-full flex-col overflow-hidden bg-canvas">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface/90 px-5 py-3 backdrop-blur-sm">
        <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-text-muted">
          // TRANSCRIPT
        </span>
        <span className="font-mono text-[11px] tabular-nums text-text-faint">
          {entries.length} {entries.length === 1 ? "critique" : "critiques"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {entries.length === 0 ? (
          <EmptyState variant={emptyVariant} onOpenSettings={onOpenSettings} />
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            <AnimatePresence initial={false}>
              {newestFirst.map((entry) => (
                <CritiqueCard
                  key={entry.critique.id}
                  critique={entry.critique}
                  personaName={entry.personaName}
                  receivedAt={entry.receivedAt}
                />
              ))}
            </AnimatePresence>
            {isCapturing && <LiveTail />}
          </div>
        )}
      </div>
    </div>
  );
}
