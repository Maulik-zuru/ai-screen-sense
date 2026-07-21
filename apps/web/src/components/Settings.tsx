import { useState } from "react";
import { saveProviderKey, testProviderKey, type ProviderId } from "../api.js";

const PROVIDERS: { id: ProviderId; label: string; placeholder: string }[] = [
  { id: "openrouter", label: "OpenRouter API key", placeholder: "sk-or-..." },
  { id: "openai", label: "OpenAI API key", placeholder: "sk-..." },
  { id: "anthropic", label: "Anthropic API key", placeholder: "sk-ant-..." },
  { id: "gemini", label: "Gemini API key", placeholder: "AIza..." },
];

type Status = "idle" | "saving" | "testing" | "ok" | "error";

function ProviderKeyField({ provider, label, placeholder, onKeySaved }: {
  provider: ProviderId;
  label: string;
  placeholder: string;
  onKeySaved: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
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
    <div>
      <label>
        {label}
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={placeholder}
        />
      </label>
      <div>
        <button onClick={handleSave} disabled={!apiKey || status === "saving"}>
          Save key
        </button>
        <button onClick={handleTest} disabled={status === "testing"}>
          Test connection
        </button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}

export function Settings({ onKeySaved }: { onKeySaved: () => void }) {
  return (
    <section>
      <h2>Settings</h2>
      <p>
        Configure at least one provider key. OpenRouter alone is enough to run every persona;
        direct provider keys are optional and used first when configured (plan §2.4).
      </p>
      {PROVIDERS.map((p) => (
        <ProviderKeyField
          key={p.id}
          provider={p.id}
          label={p.label}
          placeholder={p.placeholder}
          onKeySaved={onKeySaved}
        />
      ))}
    </section>
  );
}
