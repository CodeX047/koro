"use client";

import React from "react";

export function PlanningMetrics({ tasks }: { tasks: any[] }) {
  if (!tasks || tasks.length === 0) return null;

  const totalTasks = tasks.length;
  const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  const categories = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      className="flex gap-4 p-4 rounded-xl mb-6 overflow-x-auto"
      style={{
        backgroundColor: "var(--koro-surface-dark-elevated)",
        border: "1px solid var(--koro-hairline-strong)",
      }}
    >
      <div className="flex-1 min-w-[120px]">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--koro-ash)" }}>
          Total Tasks
        </p>
        <p className="text-xl font-bold" style={{ color: "var(--koro-on-primary)" }}>
          {totalTasks}
        </p>
      </div>

      <div className="w-px self-stretch bg-[var(--koro-hairline-strong)]" />

      <div className="flex-1 min-w-[120px]">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--koro-ash)" }}>
          Est. Hours
        </p>
        <p className="text-xl font-bold" style={{ color: "var(--koro-accent)" }}>
          {totalHours}
        </p>
      </div>

      <div className="w-px self-stretch bg-[var(--koro-hairline-strong)]" />

      <div className="flex-[2] flex gap-6 min-w-[300px]">
        {(Object.entries(categories) as [string, number][])
          .sort((a, b) => b[1] - a[1]) // highest first
          .slice(0, 4) // show top 4 categories
          .map(([cat, count]) => (
            <div key={cat}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--koro-ash)" }}>
                {cat}
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--koro-on-primary)" }}>
                {count}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
