"use client";

import { useState } from "react";
import Link from "next/link";

const WORDMARK = `
██   ██  ██████  ██████   ██████
██  ██  ██    ██ ██   ██ ██    ██
█████   ██    ██ ██████  ██    ██
██  ██  ██    ██ ██   ██ ██    ██
██   ██  ██████  ██   ██  ██████`;

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Agents", href: "#agents" },
  { label: "Pricing", href: "#pricing" },
];

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "var(--koro-canvas)",
        borderBottom: "1px solid var(--koro-hairline)",
      }}
    >
      <nav className="mx-auto flex h-[64px] max-w-[1100px] items-center justify-between px-6">
        {/* Wordmark */}
        <Link href="/" className="shrink-0 flex items-center h-full pt-[2px]">
          <pre
            className="text-[9px] sm:text-[10px] leading-[0.8] font-black whitespace-pre select-none"
            style={{
              fontFamily: "monospace",
              color: "var(--koro-ink)",
              WebkitFontSmoothing: "none",
              MozOsxFontSmoothing: "grayscale",
              textRendering: "optimizeSpeed",
            }}
          >
            {WORDMARK}
          </pre>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[16px] font-medium leading-[1.5] transition-colors"
              style={{ color: "var(--koro-mute)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--koro-ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--koro-mute)")}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-[16px] font-medium leading-[2] px-[20px] py-[4px] transition-colors"
            style={{
              backgroundColor: "var(--koro-ink)",
              color: "var(--koro-on-primary)",
              borderRadius: "var(--koro-rounded-sm)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--koro-ink-deep)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--koro-ink)")}
          >
            Get Started
          </Link>

          {/* Hamburger */}
          <button
            className="flex flex-col gap-[5px] md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span
              className="block h-[2px] w-[18px] transition-transform duration-200"
              style={{
                backgroundColor: "var(--koro-ink)",
                transform: mobileOpen ? "rotate(45deg) translate(2.5px, 2.5px)" : "none",
              }}
            />
            <span
              className="block h-[2px] w-[18px] transition-opacity duration-200"
              style={{
                backgroundColor: "var(--koro-ink)",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block h-[2px] w-[18px] transition-transform duration-200"
              style={{
                backgroundColor: "var(--koro-ink)",
                transform: mobileOpen ? "rotate(-45deg) translate(2.5px, -2.5px)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="border-t px-6 py-4 md:hidden koro-animate-fade-in"
          style={{
            backgroundColor: "var(--koro-canvas)",
            borderColor: "var(--koro-hairline)",
          }}
        >
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[16px] font-medium leading-[1.5] py-2"
                style={{ color: "var(--koro-body)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
