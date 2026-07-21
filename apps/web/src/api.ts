export interface PersonaSummary {
  id: string;
  name: string;
  scope: string[];
}

export async function fetchPersonas(): Promise<PersonaSummary[]> {
  const res = await fetch("/api/personas");
  const data = await res.json();
  return data.personas;
}

export async function fetchKeyStatus(): Promise<Record<string, boolean>> {
  const res = await fetch("/api/keys");
  const data = await res.json();
  return data.providers;
}

export type ProviderId = "openai" | "anthropic" | "gemini" | "openrouter";

export async function saveProviderKey(provider: ProviderId, apiKey: string): Promise<void> {
  const res = await fetch(`/api/keys/${provider}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to save key");
  }
}

export async function testProviderKey(provider: ProviderId): Promise<void> {
  const res = await fetch(`/api/keys/${provider}/test`, { method: "POST" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Key test failed");
  }
}
