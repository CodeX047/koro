"use client";

const FOOTER_LINKS = [
  { label: "Docs", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Changelog", href: "#" },
  { label: "Discord", href: "#" },
];

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--koro-canvas)",
        borderTop: "1px solid var(--koro-hairline)",
      }}
    >
      {/* Top link row */}
      <div className="mx-auto max-w-[1100px] px-6">
        <div
          className="flex flex-wrap items-center justify-center gap-0 py-4"
          style={{ borderBottom: "1px solid var(--koro-hairline)" }}
        >
          {FOOTER_LINKS.map((link, i) => (
            <div key={link.label} className="flex items-center">
              {i > 0 && (
                <span
                  className="mx-4 hidden sm:inline"
                  style={{ color: "var(--koro-hairline-strong)" }}
                >
                  ·
                </span>
              )}
              <a
                href={link.href}
                className="px-3 py-2 text-[14px] font-normal leading-[2] transition-colors sm:px-0"
                style={{ color: "var(--koro-mute)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--koro-ink)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--koro-mute)")
                }
              >
                {link.label}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
          <span
            className="text-[14px] font-normal leading-[2]"
            style={{ color: "var(--koro-mute)" }}
          >
            © 2026 Kōro. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-[14px] font-normal leading-[2] transition-colors"
              style={{ color: "var(--koro-mute)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--koro-ink)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--koro-mute)")
              }
            >
              Privacy
            </a>
            <span style={{ color: "var(--koro-ash)" }}>·</span>
            <a
              href="#"
              className="text-[14px] font-normal leading-[2] transition-colors"
              style={{ color: "var(--koro-mute)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--koro-ink)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--koro-mute)")
              }
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
