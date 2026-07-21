import clsx from "clsx";

export type DotState = "configured" | "unconfigured" | "testing" | "failed";

const STATE_CLASSES: Record<DotState, string> = {
  configured: "bg-live",
  unconfigured: "border border-text-faint bg-transparent",
  testing: "animate-pulse bg-warn",
  failed: "bg-crit",
};

export function StatusDot({ state }: { state: DotState }) {
  return <span className={clsx("inline-block h-2 w-2 rounded-full", STATE_CLASSES[state])} />;
}
