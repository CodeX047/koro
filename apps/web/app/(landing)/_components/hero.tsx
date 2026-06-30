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
            Ship Software. Not Just Code.
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mt-6 text-[28px] font-bold leading-[1.5] sm:text-[32px] md:text-[38px] koro-animate-fade-up koro-delay-1"
          style={{ color: "var(--koro-ink)" }}
        >
          The intelligent route from
          <br />
          idea to shipped software
        </h1>

        {/* Subheading */}
        <p
          className="mt-4 max-w-[640px] text-[16px] font-normal leading-[1.5] koro-animate-fade-up koro-delay-2"
          style={{ color: "var(--koro-body)" }}
        >
          Kōro manages the complete product lifecycle — from feature requests through AI-powered
          reviews to human-approved releases. One platform connecting Product, Engineering, QA, and
          AI.
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
            href="#features"
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
            Learn More
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
                <span className="cursor-pointer hover:text-[var(--koro-on-primary)]">Issues</span>
                <span>/</span>
                <span className="cursor-pointer hover:text-[var(--koro-on-primary)]">Roadmap</span>
                <span>/</span>
                <span className="text-[var(--koro-on-primary)] bg-[var(--koro-surface-dark-elevated)] px-2 py-0.5 rounded-sm">
                  Active Sprint
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
                  AI Agents
                </div>
                <div className="flex flex-col gap-3 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span>Product Owner</span>
                    <span style={{ color: "var(--koro-success)" }}>●</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Code Reviewer</span>
                    <span style={{ color: "var(--koro-success)" }}>●</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>QA Tester</span>
                    <span style={{ color: "var(--koro-accent)" }}>●</span>
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
                  className="flex flex-col gap-2 text-[11px]"
                  style={{ color: "var(--koro-ash)" }}
                >
                  <div>[+] PR #42 opened</div>
                  <div>[+] Issue KOR-102 created</div>
                  <div>[x] Build successful</div>
                </div>
              </div>
            </div>

            {/* Main Area (Kanban) */}
            <div className="flex-1 p-4 overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
                {/* Column 1 */}
                <div className="flex flex-col gap-3">
                  <div className="text-[12px] font-bold flex items-center justify-between">
                    <span>Todo</span>
                    <span style={{ color: "var(--koro-ash)" }}>[2]</span>
                  </div>
                  <div
                    className="p-3 rounded-sm flex flex-col gap-2"
                    style={{ border: "1px solid var(--koro-hairline-strong)" }}
                  >
                    <div className="text-[10px]" style={{ color: "var(--koro-accent)" }}>
                      KOR-102
                    </div>
                    <div className="text-[12px] leading-tight">Implement webhook endpoints</div>
                  </div>
                  <div
                    className="p-3 rounded-sm flex flex-col gap-2"
                    style={{ border: "1px solid var(--koro-hairline-strong)" }}
                  >
                    <div className="text-[10px]" style={{ color: "var(--koro-accent)" }}>
                      KOR-104
                    </div>
                    <div className="text-[12px] leading-tight">Design system tokens update</div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-3">
                  <div className="text-[12px] font-bold flex items-center justify-between">
                    <span>In Review</span>
                    <span style={{ color: "var(--koro-ash)" }}>[1]</span>
                  </div>
                  <div
                    className="p-3 rounded-sm flex flex-col gap-2 relative overflow-hidden"
                    style={{
                      border: "1px solid var(--koro-success)",
                      backgroundColor: "var(--koro-surface-dark-elevated)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[10px]" style={{ color: "var(--koro-accent)" }}>
                        KOR-99
                      </div>
                      <div
                        className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wide"
                        style={{
                          backgroundColor: "var(--koro-success)",
                          color: "var(--koro-canvas)",
                        }}
                      >
                        AI REVIEW
                      </div>
                    </div>
                    <div className="text-[12px] leading-tight">Dashboard Mockup Implementation</div>
                    <div
                      className="mt-2 text-[10px] flex items-center gap-1.5"
                      style={{ color: "var(--koro-ash)" }}
                    >
                      <span className="koro-animate-pulse" style={{ color: "var(--koro-success)" }}>
                        ●
                      </span>{" "}
                      Analyzing PR #42...
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="hidden sm:flex flex-col gap-3">
                  <div className="text-[12px] font-bold flex items-center justify-between">
                    <span>Done</span>
                    <span style={{ color: "var(--koro-ash)" }}>[1]</span>
                  </div>
                  <div
                    className="p-3 rounded-sm flex flex-col gap-2 opacity-50"
                    style={{ border: "1px solid var(--koro-hairline-strong)" }}
                  >
                    <div className="text-[10px]" style={{ color: "var(--koro-accent)" }}>
                      KOR-95
                    </div>
                    <div className="text-[12px] leading-tight">Setup CI/CD Pipeline</div>
                    <div className="text-[10px] mt-1" style={{ color: "var(--koro-ash)" }}>
                      [x] Merged by AI
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
