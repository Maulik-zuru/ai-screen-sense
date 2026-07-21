import { Link } from "react-router-dom";

const LINKS = [
  { href: "#personas", label: "The team" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-sticky border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 rotate-45 rounded-[3px] bg-accent-ink"
            aria-hidden
          />
          <span className="font-semibold tracking-[-0.02em] text-text">AI Screen Sense</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors duration-150 hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          to="/app"
          className="rounded-md bg-accent-ink px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-ink-hover focus-visible:focus-ring"
        >
          Launch app
        </Link>
      </div>
    </header>
  );
}
