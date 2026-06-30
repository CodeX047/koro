"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with Kōro — no credit card required.",
    features: ["1 Workspace Member", "1 Repository", "20 AI Reviews / month", "Community support"],
    cta: "Get Started",
    href: "/sign-up",
    primary: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For individual developers and small teams.",
    features: [
      "5 Workspace Members",
      "Unlimited Repositories",
      "500 AI Reviews / month",
      "Priority AI Processing",
    ],
    cta: "Upgrade to Pro",
    href: "/sign-up",
    primary: true,
  },
  {
    name: "Team",
    price: "$99",
    period: "per month",
    description: "For fast-moving engineering organizations.",
    features: [
      "20 Workspace Members",
      "Unlimited Repositories",
      "2000 AI Reviews / month",
      "Priority AI Processing",
      "Custom review rules",
    ],
    cta: "Upgrade to Team",
    href: "/sign-up",
    primary: false,
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

export function Pricing() {
  const { ref, inView } = useInView();

  return (
    <section
      id="pricing"
      className="px-6"
      style={{ paddingTop: "var(--koro-section)", paddingBottom: "var(--koro-section)" }}
      ref={ref}
    >
      <div className="mx-auto max-w-[1100px]">
        {/* Section divider */}
        <div style={{ borderTop: "1px solid var(--koro-hairline)" }} />

        {/* Section label */}
        <h2
          className="mt-8 text-[16px] font-bold leading-[1.5]"
          style={{ color: "var(--koro-ink)" }}
        >
          Pricing
        </h2>

        <p
          className="mt-3 text-[16px] font-normal leading-[1.5] max-w-[640px]"
          style={{ color: "var(--koro-body)" }}
        >
          Start free. Upgrade when your team needs unlimited AI power.
        </p>

        {/* Plan cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`flex flex-col p-6 ${inView ? "koro-animate-fade-up" : "opacity-0"}`}
              style={{
                animationDelay: inView ? `${i * 0.15}s` : undefined,
                border: plan.primary
                  ? "2px solid var(--koro-ink)"
                  : "1px solid var(--koro-hairline)",
                borderRadius: "var(--koro-rounded-sm)",
                backgroundColor: "var(--koro-canvas)",
              }}
            >
              {/* Plan header */}
              <div>
                <h3
                  className="text-[16px] font-bold leading-[1.5]"
                  style={{ color: "var(--koro-ink)" }}
                >
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className="text-[28px] font-bold leading-[1.5] sm:text-[32px]"
                    style={{ color: "var(--koro-ink)" }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="text-[14px] font-normal leading-[2]"
                    style={{ color: "var(--koro-mute)" }}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className="mt-2 text-[16px] font-normal leading-[1.5]"
                  style={{ color: "var(--koro-body)" }}
                >
                  {plan.description}
                </p>
              </div>

              {/* Feature list */}
              <div
                className="mt-6 flex-1"
                style={{
                  borderTop: "1px solid var(--koro-hairline)",
                  paddingTop: "16px",
                }}
              >
                {plan.features.map((feature) => (
                  <div key={feature} className="flex gap-3 py-[6px]">
                    <span
                      className="shrink-0 text-[16px] font-medium leading-[1.5]"
                      style={{ color: "var(--koro-ink)" }}
                    >
                      [✔]
                    </span>
                    <span
                      className="text-[16px] font-normal leading-[1.5]"
                      style={{ color: "var(--koro-body)" }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={plan.href}
                className="mt-6 block text-center text-[16px] font-medium leading-[2] px-[20px] py-[4px] transition-colors"
                style={{
                  backgroundColor: plan.primary ? "var(--koro-ink)" : "var(--koro-canvas)",
                  color: plan.primary ? "var(--koro-on-primary)" : "var(--koro-ink)",
                  borderRadius: "var(--koro-rounded-sm)",
                  border: plan.primary ? "none" : "1px solid var(--koro-hairline-strong)",
                }}
                onMouseEnter={(e) => {
                  if (plan.primary) {
                    e.currentTarget.style.backgroundColor = "var(--koro-ink-deep)";
                  } else {
                    e.currentTarget.style.backgroundColor = "var(--koro-surface-soft)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.primary) {
                    e.currentTarget.style.backgroundColor = "var(--koro-ink)";
                  } else {
                    e.currentTarget.style.backgroundColor = "var(--koro-canvas)";
                  }
                }}
              >
                {plan.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
