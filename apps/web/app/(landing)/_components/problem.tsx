"use client";

import { useEffect, useRef, useState } from "react";

const PAIN_POINTS = [
  {
    marker: "✕",
    pain: "Writing PRDs manually takes hours",
    detail:
      "Product managers spend days crafting requirements documents that still miss edge cases and acceptance criteria.",
  },
  {
    marker: "✕",
    pain: "Code reviews miss requirement gaps",
    detail:
      "Reviewers check code quality but rarely verify if the implementation actually matches the original product spec.",
  },
  {
    marker: "✕",
    pain: "PRs ship without context",
    detail:
      "Engineers open pull requests with no traceable link between the feature request, the spec, and the code changes.",
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

export function Problem() {
  const { ref, inView } = useInView();

  return (
    <section id="problem" className="px-6" style={{ paddingTop: "var(--koro-section)" }} ref={ref}>
      <div className="mx-auto max-w-[960px]">
        {/* Section divider */}
        <div style={{ borderTop: "1px solid var(--koro-hairline)" }} />

        {/* Section label */}
        <h2
          className="mt-8 text-[16px] font-bold leading-[1.5]"
          style={{ color: "var(--koro-ink)" }}
        >
          The problem
        </h2>

        <p
          className="mt-3 text-[16px] font-normal leading-[1.5] max-w-[640px]"
          style={{ color: "var(--koro-body)" }}
        >
          Most teams have a broken handoff between what Product defines and what Engineering ships.
          Features slip through the cracks, requirements are lost in Slack threads, and code reviews
          can't catch what was never specified.
        </p>

        {/* Pain point rows */}
        <div className="mt-8">
          {PAIN_POINTS.map((item, i) => (
            <div
              key={item.pain}
              className={`py-[12px] ${inView ? "koro-animate-slide-in" : "opacity-0"}`}
              style={{
                animationDelay: inView ? `${i * 0.1}s` : undefined,
                borderBottom: "1px solid var(--koro-hairline)",
              }}
            >
              <div className="flex gap-3">
                <span
                  className="shrink-0 text-[16px] font-medium leading-[1.5]"
                  style={{ color: "#ff3b30" }}
                >
                  {item.marker}
                </span>
                <div>
                  <span
                    className="text-[16px] font-bold leading-[1.5]"
                    style={{ color: "var(--koro-ink)" }}
                  >
                    {item.pain}
                  </span>
                  <span
                    className="ml-4 text-[16px] font-normal leading-[1.5]"
                    style={{ color: "var(--koro-body)" }}
                  >
                    {item.detail}
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
