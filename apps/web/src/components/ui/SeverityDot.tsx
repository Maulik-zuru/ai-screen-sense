import clsx from "clsx";

const SEVERITY_STYLES = {
  info: { dot: "bg-info", ink: "text-info-ink", label: "INFO" },
  warning: { dot: "bg-warn", ink: "text-warn-ink", label: "WARNING" },
  critical: { dot: "bg-crit", ink: "text-crit-ink", label: "CRITICAL" },
} as const;

export function SeverityDot({ severity }: { severity: keyof typeof SEVERITY_STYLES }) {
  const s = SEVERITY_STYLES[severity];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={clsx("h-2 w-2 rounded-full", s.dot)} aria-hidden />
      <span className={clsx("font-mono text-[11px] font-medium tracking-[0.06em]", s.ink)}>
        {s.label}
      </span>
    </span>
  );
}
