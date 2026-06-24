"use client";

import { useEffect, useRef, useState } from "react";

const AGENTS = [
  {
    name: "Discovery Agent",
    role: "Clarifies requirements",
    description:
      "Analyzes feature requests, detects missing information, asks follow-up questions, suggests existing features, and prevents duplicates.",
    marker: "[+]",
  },
  {
    name: "PRD Agent",
    role: "Generates structured product documents",
    description:
      "Creates problem statements, goals, non-goals, user stories, acceptance criteria, edge cases, and success metrics.",
    marker: "[+]",
  },
  {
    name: "Task Agent",
    role: "Creates engineering tasks",
    description:
      "Breaks approved PRDs into frontend, backend, database, testing, and DevOps tasks displayed on a Kanban board.",
    marker: "[+]",
  },
  {
    name: "QA Agent",
    role: "Reviews pull requests",
    description:
      "Validates every PR against PRD requirements, acceptance criteria, security concerns, performance, edge cases, and code quality.",
    marker: "[+]",
  },
  {
    name: "Release Agent",
    role: "Determines production readiness",
    description:
      "Evaluates overall feature completeness, review history, and outstanding issues to determine if a feature is ready to ship.",
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
          AI Agents
        </h2>

        <p
          className="mt-3 text-[16px] font-normal leading-[1.5] max-w-[640px]"
          style={{ color: "var(--koro-body)" }}
        >
          Five specialized agents work together to guide your features from idea to
          production. Each agent handles a distinct phase of the delivery lifecycle.
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
