import type { Critique } from "@ai-screen-sense/shared";

const SEVERITY_LABEL: Record<Critique["severity"], string> = {
  info: "INFO",
  warning: "WARNING",
  critical: "CRITICAL",
};

export function TranscriptFeed({ critiques }: { critiques: Critique[] }) {
  if (critiques.length === 0) {
    return <p>No critiques yet — start a session and share a window.</p>;
  }

  return (
    <ul>
      {critiques.map((c) => (
        <li key={c.id}>
          <strong>[{SEVERITY_LABEL[c.severity]}]</strong> ({c.personaId}) {c.transcriptText}
          {c.codeFix && (
            <pre>
              <code>{c.codeFix.after}</code>
            </pre>
          )}
          <small> confidence: {Math.round(c.confidence * 100)}%</small>
        </li>
      ))}
    </ul>
  );
}
