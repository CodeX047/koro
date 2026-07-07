"use client";

export function SocialProof() {
  return (
    <section className="px-6" style={{ paddingTop: "48px", paddingBottom: "48px" }}>
      <div className="mx-auto max-w-[960px]">
        <div
          className="text-center text-[14px] font-normal leading-[2] koro-animate-fade-up koro-delay-5"
          style={{ color: "var(--koro-mute)" }}
        >
          Trusted by engineering teams shipping production software
        </div>

        {/* Metric badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 koro-animate-fade-up koro-delay-6">
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-[24px] font-bold leading-[1.5]"
              style={{ color: "var(--koro-ink)" }}
            >
              500+
            </span>
            <span
              className="text-[12px] font-normal leading-[2]"
              style={{ color: "var(--koro-mute)" }}
            >
              PRDs generated
            </span>
          </div>

          <div
            className="hidden sm:block h-[32px]"
            style={{ borderLeft: "1px solid var(--koro-hairline)" }}
          />

          <div className="flex flex-col items-center gap-1">
            <span
              className="text-[24px] font-bold leading-[1.5]"
              style={{ color: "var(--koro-ink)" }}
            >
              2,000+
            </span>
            <span
              className="text-[12px] font-normal leading-[2]"
              style={{ color: "var(--koro-mute)" }}
            >
              PRs reviewed by AI
            </span>
          </div>

          <div
            className="hidden sm:block h-[32px]"
            style={{ borderLeft: "1px solid var(--koro-hairline)" }}
          />

          <div className="flex flex-col items-center gap-1">
            <span
              className="text-[24px] font-bold leading-[1.5]"
              style={{ color: "var(--koro-ink)" }}
            >
              94%
            </span>
            <span
              className="text-[12px] font-normal leading-[2]"
              style={{ color: "var(--koro-mute)" }}
            >
              Average readiness score
            </span>
          </div>

          <div
            className="hidden sm:block h-[32px]"
            style={{ borderLeft: "1px solid var(--koro-hairline)" }}
          />

          <div className="flex flex-col items-center gap-1">
            <span
              className="text-[24px] font-bold leading-[1.5]"
              style={{ color: "var(--koro-ink)" }}
            >
              &lt;2 min
            </span>
            <span
              className="text-[12px] font-normal leading-[2]"
              style={{ color: "var(--koro-mute)" }}
            >
              Avg. review turnaround
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
