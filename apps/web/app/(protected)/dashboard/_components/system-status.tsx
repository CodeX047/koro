"use client";

import { trpc } from "~/trpc/client";

export function SystemStatus() {
  const { data: health, isLoading } = trpc.health.getHealth.useQuery();
  
  const isHealthy = health?.status === "healthy";
  const statusColor = isLoading ? "var(--koro-ash)" : isHealthy ? "var(--koro-success)" : "red";

  return (
    <div>
      <div
        className="text-[10px] tracking-widest uppercase mb-3"
        style={{ color: "var(--koro-ash)" }}
      >
        System Status
      </div>
      <div className="flex flex-col gap-3 text-[12px]">
        <div className="flex items-center justify-between">
          <span style={{ color: "var(--koro-ash)" }}>AI Services</span>
          <span style={{ color: statusColor }} className={isHealthy ? "koro-animate-pulse" : ""}>●</span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ color: "var(--koro-ash)" }}>GitHub Sync</span>
          <span style={{ color: statusColor }}>●</span>
        </div>
      </div>
    </div>
  );
}
