export function Footer() {
  return (
    <footer className="py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3.5 w-3.5 rotate-45 rounded-[2px] bg-accent-ink"
            aria-hidden
          />
          <span className="text-sm font-medium text-text-secondary">AI Screen Sense</span>
        </div>
        <p className="font-mono text-[11px] tracking-[0.04em] text-text-faint">
          BYOK REAL-TIME UX AUDIT · SCREEN SHARE → LIVE CRITIQUE
        </p>
      </div>
    </footer>
  );
}
