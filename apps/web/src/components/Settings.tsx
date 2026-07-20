import { useState } from "react";
import { saveOpenRouterKey, testOpenRouterKey } from "../api.js";

export function Settings({ onKeySaved }: { onKeySaved: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "testing" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setStatus("saving");
    setMessage(null);
    try {
      await saveOpenRouterKey(apiKey);
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
      await testOpenRouterKey();
      setStatus("ok");
      setMessage("Connection OK.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <section>
      <h2>Settings</h2>
      <label>
        OpenRouter API key
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-or-..."
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
    </section>
  );
}
