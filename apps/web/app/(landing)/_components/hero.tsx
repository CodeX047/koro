"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="px-6">
      <div className="mx-auto max-w-[960px]" style={{ paddingTop: "var(--koro-section)" }}>
        {/* News badge */}
        <div className="koro-animate-fade-up">
          <span
            className="inline-block text-[14px] font-normal leading-[2] px-[8px] py-[2px]"
            style={{
              backgroundColor: "var(--koro-surface-dark)",
              color: "var(--koro-on-primary)",
              borderRadius: "var(--koro-rounded-sm)",
            }}
          >
            GitHub integration is now live
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mt-6 text-[28px] font-bold leading-[1.5] sm:text-[32px] md:text-[38px] koro-animate-fade-up koro-delay-1"
          style={{ color: "var(--koro-ink)" }}
        >
          Ship software with zero
          <br />
          friction and total confidence
        </h1>

        {/* Subheading */}
        <p
          className="mt-4 max-w-[640px] text-[16px] font-normal leading-[1.5] koro-animate-fade-up koro-delay-2"
          style={{ color: "var(--koro-body)" }}
        >
          Kōro translates simple feature requests into structured Product Requirements Documents
          (PRDs) and automatically reviews your GitHub Pull Requests to ensure every specification
          is met.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap gap-3 koro-animate-fade-up koro-delay-3">
          <Link
            href="/sign-up"
            className="inline-block text-[16px] font-medium leading-[2] px-[20px] py-[4px] transition-colors"
            style={{
              backgroundColor: "var(--koro-ink)",
              color: "var(--koro-on-primary)",
              borderRadius: "var(--koro-rounded-sm)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--koro-ink-deep)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--koro-ink)")}
          >
            Start Shipping →
          </Link>
          <a
            href="#workflow"
            className="inline-block text-[16px] font-medium leading-[2] px-[20px] py-[4px] transition-colors"
            style={{
              backgroundColor: "var(--koro-canvas)",
              color: "var(--koro-ink)",
              borderRadius: "var(--koro-rounded-sm)",
              border: "1px solid var(--koro-hairline-strong)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--koro-surface-soft)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--koro-canvas)")}
          >
            See how it works
          </a>
        </div>

        {/* Dashboard Mockup */}
        <div
          className="mt-12 koro-animate-fade-up koro-delay-4 w-full text-left overflow-hidden"
          style={{
            backgroundColor: "var(--koro-surface-dark)",
            borderRadius: "var(--koro-rounded-sm)",
            border: "1px solid var(--koro-hairline-strong)",
            color: "var(--koro-on-primary)",
            height: "420px",
          }}
        >
          {/* Dashboard Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--koro-hairline-strong)" }}
          >
            <div className="flex items-center gap-4">
              <div className="text-[14px] font-bold tracking-widest">KŌRO</div>
              <div
                className="hidden sm:flex items-center gap-3 text-[12px]"
                style={{ color: "var(--koro-ash)" }}
              >
                <span className="cursor-pointer hover:text-[var(--koro-on-primary)]">
                  Acme Corp
                </span>
                <span>/</span>
                <span className="cursor-pointer hover:text-[var(--koro-on-primary)]">
                  Core API API
                </span>
                <span>/</span>
                <span className="text-[var(--koro-on-primary)] bg-[var(--koro-surface-dark-elevated)] px-2 py-0.5 rounded-sm border border-[var(--koro-hairline-strong)]">
                  Feature Reviews
                </span>
              </div>
            </div>
            <div
              className="flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-sm"
              style={{
                backgroundColor: "var(--koro-surface-dark-elevated)",
                color: "var(--koro-ash)",
              }}
            >
              <span>Search or command</span>
              <span className="opacity-50">⌘K</span>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex h-full">
            {/* Sidebar */}
            <div
              className="hidden md:flex flex-col gap-5 w-[200px] p-4 border-r"
              style={{ borderColor: "var(--koro-hairline-strong)" }}
            >
              <div>
                <div
                  className="text-[10px] tracking-widest uppercase mb-3"
                  style={{ color: "var(--koro-ash)" }}
                >
                  GitHub Status
                </div>
                <div className="flex flex-col gap-3 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span>Repository</span>
                    <span style={{ color: "var(--koro-success)" }} className="koro-animate-pulse">
                      ●
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[var(--koro-ash)] truncate">
                    acme-corp/core-api
                  </div>
                </div>
              </div>

              <div>
                <div
                  className="text-[10px] tracking-widest uppercase mb-3"
                  style={{ color: "var(--koro-ash)" }}
                >
                  Activity
                </div>
                <div
                  className="flex flex-col gap-2 text-[11px] font-mono"
                  style={{ color: "var(--koro-ash)" }}
                >
                  <div>[+] PR #142 analyzed</div>
                  <div>[+] PRD-92 generated</div>
                  <div className="text-[var(--koro-success)]">[x] Review PASS</div>
                </div>
              </div>
            </div>

            {/* Main Area (Mock Data) */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                {/* Column 1: Feature PRD */}
                <div className="flex flex-col gap-3">
                  <div className="text-[12px] font-bold flex items-center justify-between uppercase tracking-wider">
                    <span>Active Feature</span>
                  </div>
                  <div
                    className="p-4 rounded-xl flex flex-col gap-2"
                    style={{
                      border: "1px solid var(--koro-hairline-strong)",
                      backgroundColor: "var(--koro-surface-dark-elevated)",
                    }}
                  >
                    <div className="flex justify-between">
                      <div className="text-[14px] font-bold">Stripe Webhooks</div>
                      <div
                        className="text-[9px] px-2 py-0.5 rounded-full font-bold tracking-widest border"
                        style={{
                          color: "var(--koro-accent)",
                          borderColor: "var(--koro-hairline-strong)",
                          backgroundColor: "var(--koro-surface-dark)",
                        }}
                      >
                        PRD READY
                      </div>
                    </div>
                    <div className="text-[12px] mt-2" style={{ color: "var(--koro-ash)" }}>
                      Implement webhook listener for Stripe subscription.updated and
                      subscription.deleted events to update database.
                    </div>
                  </div>
                </div>

                {/* Column 2: PR Review */}
                <div className="flex flex-col gap-3">
                  <div className="text-[12px] font-bold flex items-center justify-between uppercase tracking-wider">
                    <span>Active Review</span>
                  </div>
                  <div
                    className="p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden"
                    style={{
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      backgroundColor: "var(--koro-surface-dark-elevated)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[14px] font-bold">PR #142</div>
                      <div
                        className="text-[9px] px-2 py-0.5 rounded-full font-bold tracking-widest"
                        style={{
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                          color: "#ef4444",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        FIX REQUIRED
                      </div>
                    </div>
                    <div className="text-[12px] mt-2">feat: stripe webhooks</div>
                    <div
                      className="mt-3 text-[11px] p-2 rounded bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] font-mono"
                      style={{ color: "var(--koro-ash)" }}
                    >
                      <span className="text-[#ef4444]">Error:</span> PRD requires handling signature
                      verification (stripe-signature header) which is missing in
                      api/webhooks/route.ts.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
