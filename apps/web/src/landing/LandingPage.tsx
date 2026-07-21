import { Nav } from "./sections/Nav.js";
import { Hero } from "./sections/Hero.js";
import { PersonaTeam } from "./sections/PersonaTeam.js";
import { CodeFixDemo } from "./sections/CodeFixDemo.js";
import { HowItWorks } from "./sections/HowItWorks.js";
import { Pricing } from "./sections/Pricing.js";
import { ClosingCta } from "./sections/ClosingCta.js";
import { Footer } from "./sections/Footer.js";

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <Nav />
      <main>
        <Hero />
        <PersonaTeam />
        <CodeFixDemo />
        <HowItWorks />
        <Pricing />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
