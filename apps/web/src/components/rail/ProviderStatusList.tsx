import { StatusDot } from "../ui/StatusDot.js";

const PROVIDER_LABELS: { id: string; label: string }[] = [
  { id: "openrouter", label: "OpenRouter" },
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Anthropic" },
  { id: "gemini", label: "Gemini" },
];

export function ProviderStatusList({
  status,
  onManageKeys,
}: {
  status: Record<string, boolean>;
  onManageKeys: () => void;
}) {
  const configuredCount = PROVIDER_LABELS.filter((p) => status[p.id]).length;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-text-muted">
          PROVIDERS
        </span>
        <span className="font-mono text-[11px] tabular-nums text-text-faint">
          {configuredCount} / {PROVIDER_LABELS.length}
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {PROVIDER_LABELS.map((p) => (
          <li key={p.id} className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[13px] text-text-secondary">
              <StatusDot state={status[p.id] ? "configured" : "unconfigured"} />
              {p.label}
            </span>
            <span className="font-mono text-[11px] text-text-faint">
              {status[p.id] ? "ok" : "—"}
            </span>
          </li>
        ))}
      </ul>
      <button
        onClick={onManageKeys}
        className="mt-3 border-t border-border pt-3 text-[13px] text-text-secondary transition-colors duration-150 ease-signature hover:text-accent-ink focus-visible:focus-ring"
      >
        Manage keys →
      </button>
    </div>
  );
}
