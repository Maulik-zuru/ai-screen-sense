import { useState } from "react";
import { saveProviderKey, testProviderKey, type ProviderId } from "../../api.js";
import { Button } from "../ui/Button.js";
import { StatusDot } from "../ui/StatusDot.js";

type Status = "idle" | "saving" | "testing" | "ok" | "error";

export function ProviderKeyRow({
  provider,
  label,
  placeholder,
  helper,
  configured,
  onKeySaved,
}: {
  provider: ProviderId;
  label: string;
  placeholder: string;
  helper?: string;
  configured: boolean;
  onKeySaved: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setStatus("saving");
    setMessage(null);
    try {
      await saveProviderKey(provider, apiKey);
      onKeySaved();
      setStatus("idle");
      setMessage("Key saved.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleTest() {
    setStatus("testing");
    setMessage(null);
    try {
      await testProviderKey(provider);
      setStatus("ok");
      setMessage("Connection OK.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[13px] text-text-secondary">{label}</span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-faint">
          <StatusDot state={configured ? "configured" : "unconfigured"} />
          {configured ? "ok" : "—"}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={placeholder}
            className="h-9 w-full rounded-md border border-border bg-surface-subtle px-3 pr-9 font-mono text-[13px] text-text transition-colors duration-150 ease-signature focus-visible:focus-ring"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-text-faint transition-colors duration-150 hover:text-text-secondary"
            aria-label={visible ? "Hide key" : "Show key"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
        <Button variant="soft" onClick={handleSave} disabled={!apiKey || status === "saving"}>
          Save
        </Button>
        <Button variant="outline" onClick={handleTest} disabled={status === "testing"}>
          Test
        </Button>
      </div>

      {helper && !message && (
        <p className="mt-2 text-[13px] text-text-muted">{helper}</p>
      )}
      {message && (
        <p
          className={
            status === "error" ? "mt-2 text-[13px] text-crit-ink" : "mt-2 text-[13px] text-live-ink"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
