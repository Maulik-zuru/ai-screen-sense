import { motion } from "framer-motion";

const EASE = [0.175, 0.885, 0.32, 1.1] as const;

export function CodeFixDemo() {
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
            Not "improve contrast." The exact value that fixes it.
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-text-secondary">
            A deterministic contrast checker runs alongside the LLM — no guessing at
            ratios. When a critique includes a code fix, it's the real before/after value,
            copy-pasteable straight into your stylesheet.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {[
              "Exact WCAG ratio, computed — not estimated by a model",
              "Before/after values side by side, syntax-highlighted",
              "One-click copy, scoped to the property that's actually broken",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          className="overflow-hidden rounded-lg border border-border bg-surface shadow-card"
        >
          <div className="flex items-center justify-between border-b border-border bg-crit-surface px-4 py-2.5">
            <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-crit-ink">
              CRITICAL · ACCESSIBILITY AUDITOR
            </span>
            <span className="font-mono text-[11px] tabular-nums text-crit-ink">92%</span>
          </div>
          <div className="p-4">
            <p className="text-sm leading-relaxed text-text">
              The primary CTA fails WCAG AA — contrast is 2.8:1 against its background
              (needs 4.5:1).
            </p>
            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface-subtle">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="rounded-sm bg-surface px-1.5 py-0.5 font-mono text-[11px] text-text-muted">
                  css
                </span>
                <button className="font-mono text-[11px] tracking-[0.04em] text-accent-ink transition-colors hover:text-accent-ink-hover">
                  Copy fix
                </button>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed">
                <code>
                  <span className="text-text-faint line-through">color: #9ca3af; /* 2.8:1 */</span>
                  {"\n"}
                  <span className="text-text">color: #374151; /* 8.9:1 ✓ */</span>
                </code>
              </pre>
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[11px] tracking-[0.04em] text-text-faint">
              <span>DETERMINISTIC</span>
              <span>14:32:07</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
