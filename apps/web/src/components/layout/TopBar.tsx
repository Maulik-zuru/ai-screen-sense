import { Link } from "react-router-dom";
import { LivePill } from "../ui/LivePill.js";

export function TopBar({
  isCapturing,
  sessionId,
  elapsed,
  onOpenSettings,
}: {
  isCapturing: boolean;
  sessionId: string | null;
  elapsed: string;
  onOpenSettings: () => void;
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <Link to="/" className="flex items-center gap-2">
        <span className="inline-block h-4 w-4 rotate-45 rounded-[3px] bg-accent-ink" aria-hidden />
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-text">
          AI Screen Sense
        </span>
      </Link>

      {isCapturing && (
        <div className="flex items-center gap-3">
          <LivePill />
          <span className="font-mono text-[13px] tabular-nums text-text-secondary">{elapsed}</span>
          {sessionId && (
            <span className="hidden font-mono text-[11px] text-text-faint sm:inline">
              {sessionId}
            </span>
          )}
        </div>
      )}

      <button
        onClick={onOpenSettings}
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm text-text-secondary transition-colors duration-150 ease-signature hover:bg-bg-hover focus-visible:focus-ring"
        aria-label="Open settings"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M19.4 13a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V19a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H4a2 2 0 110-4h.09A1.65 1.65 0 005.6 8.6a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H10a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V8a1.65 1.65 0 001.51 1H20a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
        Settings
      </button>
    </header>
  );
}
