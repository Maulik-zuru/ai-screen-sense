import { motion } from "framer-motion";

const EASE = [0.175, 0.885, 0.32, 1.1] as const;

const PROVIDERS = [
  { name: "OpenRouter", note: "One key, every model — the recommended start." },
  { name: "OpenAI", note: "GPT-4o for quality-mode critiques." },
  { name: "Anthropic", note: "Claude Sonnet for the sharpest judgment calls." },
  { name: "Gemini", note: "Flash-speed, used for fast-mode by default." },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
            You bring the key. We never mark it up.
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-text-secondary">
            AI Screen Sense is BYOK — bring your own provider key. You're billed
            directly by the provider, at their rates, for exactly what you use.
            No seats, no subscription, no margin stacked on top of your tokens.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROVIDERS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
              className="rounded-lg border border-border bg-surface p-5 shadow-card"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-live" aria-hidden />
                <span className="font-mono text-sm text-text-secondary">{p.name}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{p.note}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-subtle px-5 py-4">
          <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-accent-ink">
            FAST MODE
          </span>
          <span className="text-sm text-text-secondary">
            ~1s, cheapest model per persona — for continuous background auditing.
          </span>
          <span className="mx-2 hidden h-4 w-px bg-border-strong sm:block" aria-hidden />
          <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-accent-ink">
            QUALITY MODE
          </span>
          <span className="text-sm text-text-secondary">
            Your best configured model, for the critiques you'll actually act on.
          </span>
        </div>
      </div>
    </section>
  );
}
