import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { Critique } from "@ai-screen-sense/shared";
import { SeverityDot } from "../ui/SeverityDot.js";
import { ConfidenceMeter } from "../ui/ConfidenceMeter.js";

const EASE = [0.175, 0.885, 0.32, 1.1] as const;

const SEVERITY_WASH: Record<Critique["severity"], string> = {
  info: "bg-info-surface",
  warning: "bg-warn-surface",
  critical: "bg-crit-surface",
};

const SOURCE_LABEL: Record<Critique["source"], string> = {
  llm: "LLM",
  deterministic: "DETERMINISTIC",
  council: "COUNCIL",
};

const SOURCE_CLASS: Record<Critique["source"], string> = {
  llm: "text-text-muted",
  deterministic: "text-accent-ink",
  council: "text-live-ink",
};

function CodeFixBlock({ codeFix }: { codeFix: NonNullable<Critique["codeFix"]> }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(codeFix.after);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface-subtle">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="rounded-sm bg-surface px-1.5 py-0.5 font-mono text-[11px] text-text-muted">
          {codeFix.language}
        </span>
        <button
          onClick={handleCopy}
          className="font-mono text-[11px] tracking-[0.04em] text-accent-ink transition-colors duration-150 ease-signature hover:text-accent-ink-hover focus-visible:focus-ring"
        >
          {copied ? "Copied" : "Copy fix"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed">
        <code>
          {codeFix.before && (
            <>
              <span className="text-text-faint line-through">{codeFix.before}</span>
              {"\n"}
            </>
          )}
          <span className="text-text">{codeFix.after}</span>
        </code>
      </pre>
    </div>
  );
}

export function CritiqueCard({
  critique,
  personaName,
  receivedAt,
}: {
  critique: Critique;
  personaName: string;
  receivedAt: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
      className={clsx(
        "overflow-hidden rounded-lg border border-border bg-surface shadow-card",
        critique.severity === "critical" && "ring-2 ring-crit/40"
      )}
    >
      <div
        className={clsx(
          "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5",
          SEVERITY_WASH[critique.severity]
        )}
      >
        <SeverityDot severity={critique.severity} />
        <span className="font-mono text-[11px] text-text-muted">{personaName}</span>
        <ConfidenceMeter value={Math.round(critique.confidence * 100)} />
      </div>

      <div className="p-4">
        <p className="text-sm leading-relaxed text-text">{critique.transcriptText}</p>

        {critique.codeFix && <CodeFixBlock codeFix={critique.codeFix} />}

        <div className="mt-3 flex items-center justify-between font-mono text-[11px] tracking-[0.04em]">
          <span className={SOURCE_CLASS[critique.source]}>{SOURCE_LABEL[critique.source]}</span>
          <span className="text-text-faint">
            {new Date(receivedAt).toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
