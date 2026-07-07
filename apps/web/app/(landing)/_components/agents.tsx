"use client";

import { useEffect, useRef, useState } from "react";

const AGENTS = [
  {
    name: "Sync Agent",
    role: "Maintains codebase context",
    description:
      "Constantly indexes your GitHub repositories in the background to build deep contextual awareness of your entire architecture.",
    marker: "[+]",
  },
  {
    name: "Discovery Agent",
    role: "Clarifies requirements",
    description:
      "Analyzes simple feature ideas, detects missing edge cases, asks follow-up questions, and ensures the product need is well-defined.",
    marker: "[+]",
  },
  {
    name: "PRD Agent",
    role: "Generates specifications",
    description:
      "Translates clarified feature requests into structured Product Requirements Documents complete with acceptance criteria and user stories.",
    marker: "[+]",
  },
  {
    name: "Review Agent",
    role: "Analyzes Pull Requests",
    description:
      "Listens to GitHub webhook events, analyzes code diffs, and leaves inline comments on PRs evaluating code quality and PRD fulfillment.",
    marker: "[+]",
  },
  {
    name: "Scoring Agent",
    role: "Calculates release readiness",
    description:
      "Aggregates review data to generate a final 'Readiness Score' (0-100%) and a verdict (PASS/FIX_REQUIRED) before merging.",
    marker: "[+]",
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

export function Agents() {
  const { ref, inView } = useInView();

  return (
    <section
      id="agents"
      className="px-6"
      style={{ paddingTop: "var(--koro-section)" }}
      ref={ref}
    >
      <div className="mx-auto max-w-[960px]">
        {/* Section divider */}
        <div style={{ borderTop: "1px solid var(--koro-hairline)" }} />

        {/* Section label */}
        <h2
          className="mt-8 text-[16px] font-bold leading-[1.5]"
          style={{ color: "var(--koro-ink)" }}
        >
          Under the Hood: Specialized AI
        </h2>

        <p
          className="mt-3 text-[16px] font-normal leading-[1.5] max-w-[640px]"
          style={{ color: "var(--koro-body)" }}
        >
          Kōro doesn't rely on a single generic AI. It uses a suite of specialized agents, each focused on a distinct phase of the software delivery lifecycle.
        </p>

        {/* Agent cards */}
        <div className="mt-8 grid gap-0">
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              className={`py-[16px] ${inView ? "koro-animate-slide-in" : "opacity-0"}`}
              style={{
                animationDelay: inView ? `${i * 0.1}s` : undefined,
                borderBottom: "1px solid var(--koro-hairline)",
              }}
            >
              <div className="flex gap-3">
                <span
                  className="shrink-0 text-[16px] font-medium leading-[1.5]"
                  style={{ color: "var(--koro-ink)" }}
                >
                  {agent.marker}
                </span>
                <div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span
                      className="text-[16px] font-bold leading-[1.5]"
                      style={{ color: "var(--koro-ink)" }}
                    >
                      {agent.name}
                    </span>
                    <span
                      className="text-[14px] font-normal leading-[2]"
                      style={{ color: "var(--koro-mute)" }}
                    >
                      — {agent.role}
                    </span>
                  </div>
                  <p
                    className="mt-1 text-[16px] font-normal leading-[1.5]"
                    style={{ color: "var(--koro-body)" }}
                  >
                    {agent.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
