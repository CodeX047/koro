"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen koro-landing font-[family-name:var(--font-mono)] antialiased selection:bg-[var(--koro-ink)] selection:text-[var(--koro-canvas)]"
      style={{ backgroundColor: "var(--koro-canvas)" }}
    >
      <div className="text-center max-w-[600px] px-6">
        {/* Badge */}
        <div className="koro-animate-fade-up">
          <span
            className="inline-block text-[14px] font-normal leading-[2] px-[8px] py-[2px]"
            style={{
              backgroundColor: "var(--koro-surface-dark)",
              color: "var(--koro-on-primary)",
              borderRadius: "var(--koro-rounded-sm)",
            }}
          >
            404 Error
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mt-6 text-[48px] font-bold leading-[1.1] sm:text-[64px] md:text-[80px] koro-animate-fade-up koro-delay-1"
          style={{ color: "var(--koro-ink)" }}
        >
          Page not found
        </h1>

        {/* Subheading */}
        <p
          className="mt-4 text-[16px] font-normal leading-[1.5] koro-animate-fade-up koro-delay-2 mx-auto"
          style={{ color: "var(--koro-body)" }}
        >
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
          Let's get you back on track.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 koro-animate-fade-up koro-delay-3">
          <Link
            href="/"
            className="inline-block text-[16px] font-medium leading-[2] px-[20px] py-[4px] transition-colors"
            style={{
              backgroundColor: "var(--koro-ink)",
              color: "var(--koro-on-primary)",
              borderRadius: "var(--koro-rounded-sm)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--koro-ink-deep)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--koro-ink)")}
          >
            Return Home →
          </Link>
          <Link
            href="/dashboard"
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
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
