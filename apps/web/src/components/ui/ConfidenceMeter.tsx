import clsx from "clsx";

export function ConfidenceMeter({ value }: { value: number }) {
  const segments = 4;
  const filled = Math.round((value / 100) * segments);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={clsx("h-2.5 w-1.5 rounded-[1px]", i < filled ? "bg-accent" : "bg-border-strong")}
          />
        ))}
      </span>
      <span className="font-mono text-[13px] font-medium tabular-nums text-text-secondary">
        {value}%
      </span>
    </span>
  );
}
