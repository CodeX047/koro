export function Architecture() {
  const steps = ["Product", "Engineering", "AI", "Human Review", "Production"];

  return (
    <section
      id="architecture"
      className="px-6"
      style={{ paddingTop: "var(--koro-section)", paddingBottom: "var(--koro-section)" }}
    >
      <div className="mx-auto max-w-[960px]">
        {/* Section divider */}
        <div style={{ borderTop: "1px solid var(--koro-hairline)" }} />

        {/* Section label */}
        <h2
          className="mt-8 text-[16px] font-bold leading-[1.5]"
          style={{ color: "var(--koro-ink)" }}
        >
          Built for Modern Teams
        </h2>

        {/* Desktop Pipeline */}
        <div className="mt-12 hidden md:flex items-center justify-between w-full">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div 
                className="flex-1 flex items-center justify-center p-4 rounded-sm border border-[var(--koro-hairline-strong)] text-[14px] font-medium whitespace-nowrap"
                style={{ 
                  backgroundColor: "var(--koro-canvas)",
                  color: "var(--koro-ink)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                }}
              >
                {step}
              </div>
              {index < steps.length - 1 && (
                <div className="flex-shrink-0 px-4 text-[var(--koro-ash)] font-mono">──►</div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Pipeline */}
        <div className="mt-8 flex flex-col md:hidden items-center gap-4">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center gap-4 w-full max-w-[240px]">
              <div 
                className="w-full flex items-center justify-center p-4 rounded-sm border border-[var(--koro-hairline-strong)] text-[14px] font-medium"
                style={{ 
                  backgroundColor: "var(--koro-canvas)",
                  color: "var(--koro-ink)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                }}
              >
                {step}
              </div>
              {index < steps.length - 1 && (
                <div className="flex flex-col items-center text-[var(--koro-ash)] font-mono leading-none">
                  <span>│</span>
                  <span>▼</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
