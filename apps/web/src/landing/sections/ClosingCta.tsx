import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const EASE = [0.175, 0.885, 0.32, 1.1] as const;

export function ClosingCta() {
  return (
    <section className="border-b border-border py-24">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="text-balance text-3xl font-semibold tracking-[-0.03em] text-text md:text-5xl">
          Stop shipping the mistakes a second pair of eyes would've caught.
        </h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-text-secondary">
          Add one provider key. Share a window. Start hearing what's actually wrong —
          while there's still time to fix it before launch.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/app"
            className="rounded-md bg-accent-ink px-6 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-ink-hover focus-visible:focus-ring"
          >
            Start a free audit
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
