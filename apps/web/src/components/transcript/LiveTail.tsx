export function LiveTail() {
  return (
    <p className="flex items-center justify-center gap-2 py-4 font-mono text-[11px] tracking-[0.04em] text-text-faint">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-live-ping rounded-full bg-text-faint opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-text-faint" />
      </span>
      listening…
    </p>
  );
}
