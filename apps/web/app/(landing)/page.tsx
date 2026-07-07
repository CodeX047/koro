import type { Metadata } from "next";
import { Hero } from "./_components/hero";
import { SocialProof } from "./_components/social-proof";
import { Problem } from "./_components/problem";
import { Features } from "./_components/features";
import { Workflow } from "./_components/workflow";
import { Agents } from "./_components/agents";
import { Testimonials } from "./_components/testimonials";
import { Pricing } from "./_components/pricing";
import { FAQ } from "./_components/faq";
import { FinalCTA } from "./_components/final-cta";

export const metadata: Metadata = {
  title: "Kōro — Ship software with zero friction and total confidence",
  description:
    "Kōro translates feature requests into structured PRDs and automatically reviews your GitHub Pull Requests to ensure every specification is met. AI-powered code reviews for modern engineering teams.",
  openGraph: {
    title: "Kōro — Ship software with zero friction",
    description:
      "AI-powered PRD generation and GitHub PR reviews. From feature request to production merge.",
    type: "website",
    siteName: "Kōro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kōro — Ship software with zero friction",
    description:
      "AI-powered PRD generation and GitHub PR reviews. From feature request to production merge.",
  },
};

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <SocialProof />
      <Problem />
      <Features />
      <Workflow />
      <Agents />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
