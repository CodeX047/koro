"use client";

import { useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "We used to spend two days writing PRDs for every feature. Kōro generates them in minutes — and they're more thorough than what we wrote manually.",
    name: "Priya Sharma",
    role: "Head of Product, DevScale",
  },
  {
    quote:
      "The AI code reviews catch requirement gaps that our senior engineers miss. It's like having a QA engineer who has actually read the spec.",
    name: "Marcus Chen",
    role: "Engineering Lead, Stackform",
  },
  {
    quote:
      "We connected our GitHub repos and within 10 minutes had our first AI-powered PR review. The setup was shockingly simple.",
    name: "Sarah Williams",
    role: "CTO, LaunchPad Labs",
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

export function Testimonials() {
  const { ref, inView } = useInView();

  return (
    <section
      id="testimonials"
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
          What teams are saying
        </h2>

        {/* Testimonial cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`flex flex-col gap-4 p-5 ${inView ? "koro-animate-fade-up" : "opacity-0"}`}
              style={{
                animationDelay: inView ? `${i * 0.12}s` : undefined,
                border: "1px solid var(--koro-hairline)",
                borderRadius: "var(--koro-rounded-sm)",
                backgroundColor: "var(--koro-canvas)",
              }}
            >
              <p
                className="text-[15px] font-normal leading-[1.6] flex-1"
                style={{ color: "var(--koro-body)" }}
              >
                "{t.quote}"
              </p>
              <div>
                <div
                  className="text-[14px] font-bold leading-[1.5]"
                  style={{ color: "var(--koro-ink)" }}
                >
                  {t.name}
                </div>
                <div
                  className="text-[13px] font-normal leading-[1.5]"
                  style={{ color: "var(--koro-mute)" }}
                >
                  {t.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
