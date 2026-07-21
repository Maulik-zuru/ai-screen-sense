import { motion } from "framer-motion";

const EASE = [0.175, 0.885, 0.32, 1.1] as const;

const STEPS = [
  {
    n: "01",
    title: "Share a window",
    body: "Grant screen access to one window or tab. Frame-diffing means static screens don't burn your API budget.",
  },
  {
    n: "02",
    title: "Pick a persona, pick a mode",
    body: "Choose which lens is watching — Accessibility, Mobile, Conversion, and five more. Fast for a cheap, quick pass; Quality for your best model.",
  },
  {
    n: "03",
    title: "Get feedback as it happens",
    body: "Critiques stream in as they're found, spoken aloud if you want, each with severity, confidence, and a fix you can paste.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-canvas py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
          From screen share to critique in under a second.
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.1 }}
              className="relative"
            >
              <span className="font-mono text-sm font-medium tabular-nums text-text-faint">
                {step.n}
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-[-0.01em] text-text">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.body}</p>
              {i < STEPS.length - 1 && (
                <span
                  className="absolute right-[-1.25rem] top-2 hidden h-px w-8 bg-border-strong md:block"
                  aria-hidden
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
