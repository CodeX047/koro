import { Hero } from "./_components/hero";
import { Features } from "./_components/features";
import { Workflow } from "./_components/workflow";
import { Agents } from "./_components/agents";
import { Architecture } from "./_components/architecture";
import { Pricing } from "./_components/pricing";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <Workflow />
      <Agents />
      <Architecture />
      <Pricing />
    </main>
  );
}
