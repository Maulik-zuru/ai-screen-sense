import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "outline" | "soft" | "ghost" | "destructive";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-accent-ink text-white hover:bg-accent-ink-hover disabled:hover:bg-accent-ink",
  outline:
    "border border-border text-text hover:border-border-hover hover:bg-bg-hover",
  soft: "bg-accent-surface text-accent-ink hover:bg-accent-surface",
  ghost: "text-text-secondary hover:bg-bg-hover",
  destructive: "bg-crit-surface text-crit-ink hover:bg-crit-surface",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ variant = "primary", className, disabled, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={clsx(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors duration-150 ease-signature focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
