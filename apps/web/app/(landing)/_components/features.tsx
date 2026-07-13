"use client";

import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    marker: "[+]",
    title: "Feature Requests & PRD Generation",
    description:
      "Submit simple feature ideas. AI expands them into structured Product Requirements Documents (PRDs) with acceptance criteria and edge cases.",
  },
  {
    marker: "[+]",
    title: "GitHub App Integration",
    description:
      "Connect your GitHub repositories in one click. Kōro automatically syncs branches, listens to pull requests, and tracks repository events.",
  },
  {
    marker: "[+]",
    title: "AI Pull Request Code Reviews",
    description:
      "Every pull request is automatically analyzed. AI reviews the code against your PRD requirements and leaves inline comments on GitHub.",
  },
  {
    marker: "[+]",
    title: "Readiness Scoring & Verdicts",
    description:
      "Get a clear 'PASS' or 'FIX_REQUIRED' verdict for every PR. Kōro calculates a readiness score based on requirement fulfillment and code quality.",
  },
  {
    marker: "[+]",
    title: "Active Project Tracking",
    description:
      "Organize your work into projects. Track feature counts, code review history, and overall project health in real-time.",
  },
  {
    marker: "[+]",
    title: "Continuous Repo Syncing",
    description:
      "We build vector embeddings of your codebase. When AI generates PRDs or reviews code, it has full context of your existing architecture.",
  },
];

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export function Features() {
  const { ref, inView } = useInView();

  return (
    <section id="features" className="px-6" style={{ paddingTop: "var(--koro-section)" }} ref={ref}>
      <div className="mx-auto max-w-[960px]">
        {/* Section divider */}
        <div style={{ borderTop: "1px solid var(--koro-hairline)" }} />

        {/* Section label */}
        <h2
          className="mt-8 text-[16px] font-bold leading-[1.5]"
          style={{ color: "var(--koro-ink)" }}
        >
          Core Capabilities
        </h2>

        <p
          className="mt-3 text-[16px] font-normal leading-[1.5] max-w-[640px]"
          style={{ color: "var(--koro-body)" }}
        >
          Kōro bridges the gap between product requirements and engineering execution. It
          automatically translates ideas into specifications and ensures your code actually meets
          those requirements.
        </p>

        {/* Feature rows */}
        <div className="mt-8">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`py-[8px] ${inView ? "koro-animate-slide-in" : "opacity-0"}`}
              style={{
                animationDelay: inView ? `${i * 0.07}s` : undefined,
                borderBottom: "1px solid var(--koro-hairline)",
              }}
            >
              <div className="flex gap-3">
                <span
                  className="shrink-0 text-[16px] font-medium leading-[1.5]"
                  style={{ color: "var(--koro-ink)" }}
                >
                  {feature.marker}
                </span>
                <div>
                  <span
                    className="text-[16px] font-bold leading-[1.5]"
                    style={{ color: "var(--koro-ink)" }}
                  >
                    {feature.title}
                  </span>
                  <span
                    className="ml-4 text-[16px] font-normal leading-[1.5]"
                    style={{ color: "var(--koro-body)" }}
                  >
                    {feature.description}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
