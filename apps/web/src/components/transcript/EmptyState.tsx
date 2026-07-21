import { Button } from "../ui/Button.js";

export type EmptyStateVariant = "no-keys" | "ready" | "listening";

const ICONS: Record<EmptyStateVariant, JSX.Element> = {
  "no-keys": (
    <>
      <circle cx="8" cy="15" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10.5 12.5L18 5M15.5 7.5L18 5M18 5l2 2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  ready: (
    <path
      d="M9 7l6 4-6 4V7z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  listening: (
    <path
      d="M6 12h1.5l1.5-4 2 8 1.5-6 1 2H18"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
};

const COPY: Record<EmptyStateVariant, { title: string; body: string }> = {
  "no-keys": {
    title: "Add a provider key to begin",
    body: "AI Screen Sense uses your own API key. OpenRouter alone runs everything.",
  },
  ready: {
    title: "Ready when you are",
    body: "Pick a persona and press Start to share a window and begin the live audit.",
  },
  listening: {
    title: "Watching your screen…",
    body: "Critiques will appear here as issues are detected. Nothing yet — that's a good sign.",
  },
};

export function EmptyState({
  variant,
  onOpenSettings,
}: {
  variant: EmptyStateVariant;
  onOpenSettings?: () => void;
}) {
  const copy = COPY[variant];

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-5 flex h-14 w-14 animate-float items-center justify-center rounded-lg bg-surface-subtle text-text-muted">
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
          {ICONS[variant]}
        </svg>
      </div>
      <h3 className="text-base font-semibold tracking-[-0.01em] text-text">{copy.title}</h3>
      <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-text-muted">{copy.body}</p>
      {variant === "no-keys" && onOpenSettings && (
        <Button className="mt-5" onClick={onOpenSettings}>
          Open Settings
        </Button>
      )}
    </div>
  );
}
