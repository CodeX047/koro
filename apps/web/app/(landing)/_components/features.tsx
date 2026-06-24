"use client";

import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    marker: "[+]",
    title: "Feature Request Management",
    description:
      "Create, edit, and track feature requests with title, description, priority, and status.",
  },
  {
    marker: "[+]",
    title: "AI Requirement Clarification",
    description:
      "AI detects missing information, asks follow-up questions, and prevents duplicate requests.",
  },
  {
    marker: "[+]",
    title: "PRD Generation",
    description:
      "AI generates structured PRDs with goals, user stories, acceptance criteria, and edge cases.",
  },
  {
    marker: "[+]",
    title: "Task Planning & Kanban",
    description:
      "Approved PRDs become actionable engineering tasks on a Kanban board — Todo, In Progress, Review, Done.",
  },
  {
    marker: "[+]",
    title: "GitHub Integration",
    description:
      "Connect repositories, receive webhook events, fetch changed files, and analyze diffs automatically.",
  },
  {
    marker: "[+]",
    title: "AI-Powered PR Reviews",
    description:
      "Every pull request validated against PRD requirements, acceptance criteria, security, and code quality.",
  },
  {
    marker: "[+]",
    title: "Re-Review Workflow",
    description:
      "When developers push fixes, AI re-fetches, compares findings, validates, and generates updated reports.",
  },
  {
    marker: "[+]",
    title: "Human Approval & Release",
    description:
      "Reviewers verify PRD, tasks, PR, and AI review history before approving features for production.",
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
    <section
      id="features"
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
          What is Kōro?
        </h2>

        <p
          className="mt-3 text-[16px] font-normal leading-[1.5] max-w-[640px]"
          style={{ color: "var(--koro-body)" }}
        >
          An AI-powered platform that guides software teams from feature requests to
          production releases — connecting Product, Engineering, QA, and AI into a single
          delivery pipeline.
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
