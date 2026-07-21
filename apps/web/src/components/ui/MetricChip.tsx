export function MetricChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-sm border border-border bg-surface px-2 py-1.5">
      <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-text-muted">
        {label}
      </span>
      <span className="font-mono text-[13px] font-medium tabular-nums text-text">{value}</span>
    </div>
  );
}
