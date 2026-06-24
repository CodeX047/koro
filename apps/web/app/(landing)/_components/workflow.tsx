"use client";

import { useEffect, useRef, useState } from "react";

const WORKFLOW_STAGES = [
  { label: "Request", desc: "User submits feature request" },
  { label: "Discovery", desc: "AI asks clarifying questions" },
  { label: "PRD", desc: "AI generates specifications" },
  { label: "Tasks", desc: "AI plans Kanban tasks" },
  { label: "Review", desc: "AI & Human code review" },
  { label: "Ship", desc: "Deploy to production" },
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

export function Workflow() {
  const { ref, inView } = useInView();

  const renderCard = (index: number) => {
    const step = WORKFLOW_STAGES[index];
    if (!step) return null;
    const isShip = step.label === "Ship";
    return (
      <div 
        className={`flex flex-col gap-2 p-4 w-full h-full relative ${inView ? "koro-animate-fade-up" : "opacity-0"}`}
        style={{
          animationDelay: inView ? `${index * 0.1}s` : undefined,
          backgroundColor: isShip ? "var(--koro-ink)" : "var(--koro-canvas)",
          border: "1px solid var(--koro-hairline-strong)",
          borderRadius: "var(--koro-rounded-sm)",
          color: isShip ? "var(--koro-on-primary)" : "var(--koro-ink)",
        }}
      >
        <div className="text-[12px] font-mono mb-1" style={{ color: "var(--koro-ash)", opacity: 0.8 }}>0{index + 1}</div>
        <div className="text-[14px] font-bold">{step.label}</div>
        <div 
          className="text-[12px] leading-[1.5]"
          style={{ color: isShip ? "var(--koro-ash)" : "var(--koro-body)" }}
        >
          {step.desc}
        </div>
      </div>
    );
  };

  return (
    <section
      id="workflow"
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
          How it works
        </h2>

        <p
          className="mt-3 text-[16px] font-normal leading-[1.5] max-w-[640px]"
          style={{ color: "var(--koro-body)" }}
        >
          Every feature follows a traceable path from idea to production. AI handles the
          heavy lifting — humans stay in control.
        </p>

        {/* S-Shape Flowchart pipeline (Desktop) */}
        <div className="mt-16 w-full hidden md:grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-x-4 gap-y-6 items-center">
          {/* Row 1 */}
          <div className="col-start-1 row-start-1">{renderCard(0)}</div>
          <div className="col-start-2 row-start-1 flex justify-center text-[var(--koro-ash)] font-mono">──►</div>
          <div className="col-start-3 row-start-1">{renderCard(1)}</div>
          <div className="col-start-4 row-start-1 flex justify-center text-[var(--koro-ash)] font-mono">──►</div>
          <div className="col-start-5 row-start-1">{renderCard(2)}</div>
          
          {/* Row 2 (Down Arrow) */}
          <div className="col-start-5 row-start-2 flex justify-center text-[var(--koro-ash)] font-mono py-2">
            <div className="flex flex-col items-center leading-none">
              <span>│</span>
              <span>▼</span>
            </div>
          </div>
          
          {/* Row 3 (Notice the order is right-to-left) */}
          <div className="col-start-5 row-start-3">{renderCard(3)}</div>
          <div className="col-start-4 row-start-3 flex justify-center text-[var(--koro-ash)] font-mono">◄──</div>
          <div className="col-start-3 row-start-3">{renderCard(4)}</div>
          <div className="col-start-2 row-start-3 flex justify-center text-[var(--koro-ash)] font-mono">◄──</div>
          <div className="col-start-1 row-start-3">{renderCard(5)}</div>
        </div>

        {/* Vertical Flowchart (Mobile) */}
        <div className="mt-12 flex flex-col md:hidden gap-4 items-center">
          {WORKFLOW_STAGES.map((step, i) => (
            <div key={step.label} className="w-full flex flex-col items-center gap-4">
              {renderCard(i)}
              {i < 5 && (
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
