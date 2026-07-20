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

export async function saveOpenRouterKey(apiKey: string): Promise<void> {
  const res = await fetch("/api/keys/openrouter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to save key");
  }
}

export async function testOpenRouterKey(): Promise<void> {
  const res = await fetch("/api/keys/openrouter/test", { method: "POST" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Key test failed");
  }
}
