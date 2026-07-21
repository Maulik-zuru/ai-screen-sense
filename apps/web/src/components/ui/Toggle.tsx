import clsx from "clsx";

export function Toggle({
  checked,
  onChange,
  label,
  sublabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  sublabel?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="flex flex-col">
        <span className="text-sm text-text">{label}</span>
        {sublabel && (
          <span className="font-mono text-[11px] tracking-[0.04em] text-text-faint">
            {sublabel}
          </span>
        )}
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={clsx(
            "block h-5 w-9 rounded-full transition-colors duration-150 ease-signature peer-focus-visible:focus-ring",
            checked ? "bg-accent-ink" : "bg-border-strong"
          )}
        />
        <span
          className={clsx(
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-card transition-transform duration-150 ease-signature",
            checked && "translate-x-4"
          )}
        />
      </span>
    </label>
  );
}
