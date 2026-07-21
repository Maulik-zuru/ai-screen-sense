import { motion } from "framer-motion";
import clsx from "clsx";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

const EASE = [0.175, 0.885, 0.32, 1.1] as const;

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={clsx(
        "relative flex rounded-md bg-surface-subtle p-1",
        disabled && "opacity-50"
      )}
      role="radiogroup"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "relative z-10 flex-1 rounded-[6px] px-3 py-1.5 text-sm transition-colors duration-150 ease-signature focus-visible:focus-ring disabled:cursor-not-allowed",
              active ? "font-medium text-text" : "text-text-muted"
            )}
          >
            {active && (
              <motion.span
                layoutId="segmented-thumb"
                className="absolute inset-0 -z-10 rounded-[6px] border border-border bg-surface shadow-card"
                transition={{ duration: 0.15, ease: EASE }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
