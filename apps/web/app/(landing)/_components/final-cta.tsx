"use client";

import Link from "next/link";

export function FinalCTA() {
  return (
    <section
      className="px-6"
      style={{ paddingTop: "var(--koro-section)", paddingBottom: "var(--koro-section)" }}
    >
      <div className="mx-auto max-w-[960px]">
        {/* Section divider */}
        <div style={{ borderTop: "1px solid var(--koro-hairline)" }} />

        <div className="mt-12 text-center">
          <h2
            className="text-[24px] font-bold leading-[1.5] sm:text-[28px]"
            style={{ color: "var(--koro-ink)" }}
          >
            Start shipping with confidence
          </h2>

          <p
            className="mt-4 text-[16px] font-normal leading-[1.5] max-w-[520px] mx-auto"
            style={{ color: "var(--koro-body)" }}
          >
            Connect your GitHub, submit your first feature request, and get an AI-powered
            code review — all in under 5 minutes. Free forever for solo developers.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-block text-[16px] font-medium leading-[2] px-[24px] py-[6px] transition-colors"
              style={{
                backgroundColor: "var(--koro-ink)",
                color: "var(--koro-on-primary)",
                borderRadius: "var(--koro-rounded-sm)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--koro-ink-deep)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--koro-ink)")}
            >
              Start Free Trial →
            </Link>
          </div>

          <p
            className="mt-4 text-[13px] font-normal leading-[2]"
            style={{ color: "var(--koro-mute)" }}
          >
            No credit card required · 20 free AI reviews per month
          </p>
        </div>
      </div>
    </section>
  );
}
