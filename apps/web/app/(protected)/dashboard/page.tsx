import React from "react";
import { requireAuth } from "~/features/auth/utils/auth";

export default async function DashboardPage() {
  await requireAuth();
  
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Overview Stats */}
      <div>
        <div className="text-[12px] font-bold mb-4 flex items-center justify-between uppercase tracking-wider" style={{ color: "var(--koro-on-primary)" }}>
          <span>Overview</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className="p-4 rounded-sm flex flex-col gap-3 relative overflow-hidden"
            style={{ border: "1px solid var(--koro-hairline-strong)" }}
          >
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--koro-ash)" }}>AI Usage</div>
            <div className="text-[28px] font-bold">15 <span className="text-[16px] text-[var(--koro-ash)] font-normal">/ 20</span></div>
            <div className="text-[11px]" style={{ color: "var(--koro-ash)" }}>Reset in 8 days</div>
          </div>
          
          <div 
            className="p-4 rounded-sm flex flex-col gap-3 relative overflow-hidden"
            style={{ border: "1px solid var(--koro-hairline-strong)" }}
          >
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--koro-ash)" }}>GitHub Status</div>
            <div className="text-[20px] font-bold flex items-center gap-2 h-[42px]" style={{ color: "var(--koro-success)" }}>
              <span className="text-[12px] koro-animate-pulse">●</span> Connected
            </div>
            <div className="text-[11px] font-mono" style={{ color: "var(--koro-ash)" }}>Syncing: repo/koro</div>
          </div>
          
          <div 
            className="p-4 rounded-sm flex flex-col gap-3 relative overflow-hidden"
            style={{ border: "1px solid var(--koro-hairline-strong)" }}
          >
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--koro-ash)" }}>Readiness Score</div>
            <div className="text-[28px] font-bold" style={{ color: "var(--koro-accent)" }}>85%</div>
            <div className="text-[11px]" style={{ color: "var(--koro-ash)" }}>Target standard: 90%</div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div>
        <div className="text-[12px] font-bold mb-4 flex items-center justify-between uppercase tracking-wider">
          <span>Active Projects</span>
          <span className="cursor-pointer text-[var(--koro-accent)] hover:text-[var(--koro-on-primary)] transition-colors lowercase tracking-normal">[+] new project</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className="p-4 rounded-sm flex flex-col gap-3 cursor-pointer group transition-colors"
            style={{ 
              border: "1px solid var(--koro-hairline-strong)",
              backgroundColor: "var(--koro-surface-dark)"
            }}
          >
            <div className="flex justify-between items-start">
              <div className="text-[14px] font-bold group-hover:text-[var(--koro-accent)] transition-colors">Kōro Web App</div>
              <div className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wide" style={{ backgroundColor: "var(--koro-surface-dark-elevated)", color: "var(--koro-success)" }}>ACTIVE</div>
            </div>
            <div className="text-[12px] leading-relaxed" style={{ color: "var(--koro-ash)" }}>
              Main Next.js product planning dashboard and AI review integrations.
            </div>
            <div className="text-[10px] mt-2" style={{ color: "var(--koro-ash)", opacity: 0.7 }}>
              Updated 2 hours ago
            </div>
          </div>
          
          <div 
            className="p-4 rounded-sm flex flex-col gap-3 cursor-pointer group transition-colors"
            style={{ 
              border: "1px solid var(--koro-hairline-strong)",
              backgroundColor: "var(--koro-surface-dark)"
            }}
          >
            <div className="flex justify-between items-start">
              <div className="text-[14px] font-bold group-hover:text-[var(--koro-accent)] transition-colors">Kōro Core API</div>
              <div className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wide" style={{ backgroundColor: "var(--koro-surface-dark-elevated)", color: "var(--koro-success)" }}>ACTIVE</div>
            </div>
            <div className="text-[12px] leading-relaxed" style={{ color: "var(--koro-ash)" }}>
              Go back-end APIs, database migration management, and LLM integrations.
            </div>
            <div className="text-[10px] mt-2" style={{ color: "var(--koro-ash)", opacity: 0.7 }}>
              Updated 1 day ago
            </div>
          </div>
        </div>
      </div>

      {/* Activity / Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="text-[12px] font-bold mb-4 flex items-center justify-between uppercase tracking-wider">
            <span>Recent Features</span>
          </div>
          <div className="flex flex-col gap-3">
            <div 
              className="p-4 rounded-sm flex flex-col gap-2"
              style={{ border: "1px solid var(--koro-hairline-strong)" }}
            >
              <div className="flex justify-between items-start">
                <div className="text-[13px] font-bold">Organization Swapper</div>
                <div className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wide mt-0.5" style={{ backgroundColor: "var(--koro-surface-dark-elevated)", color: "var(--koro-accent)" }}>PRD READY</div>
              </div>
              <div className="text-[12px]" style={{ color: "var(--koro-ash)" }}>Better Auth scoping integration</div>
            </div>

            <div 
              className="p-4 rounded-sm flex flex-col gap-2 relative overflow-hidden"
              style={{ 
                border: "1px solid var(--koro-success)",
                backgroundColor: "var(--koro-surface-dark-elevated)"
              }}
            >
              <div className="flex justify-between items-start">
                <div className="text-[13px] font-bold">AI Code Reviewer</div>
                <div className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wide mt-0.5" style={{ backgroundColor: "var(--koro-success)", color: "var(--koro-canvas)" }}>IN PROGRESS</div>
              </div>
              <div className="text-[12px]" style={{ color: "var(--koro-ash)" }}>Parse Pull Request diffs automatically</div>
              <div className="mt-2 text-[11px] flex items-center gap-1.5 font-medium" style={{ color: "var(--koro-on-primary)" }}>
                <span className="koro-animate-pulse" style={{ color: "var(--koro-success)" }}>●</span> Analyzing PR #42...
              </div>
            </div>

            <div 
              className="p-4 rounded-sm flex flex-col gap-2"
              style={{ border: "1px solid var(--koro-hairline-strong)", opacity: 0.7 }}
            >
              <div className="flex justify-between items-start">
                <div className="text-[13px] font-bold">Razorpay Webhooks</div>
                <div className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wide mt-0.5" style={{ backgroundColor: "var(--koro-surface-dark-elevated)", color: "var(--koro-success)" }}>SHIPPED</div>
              </div>
              <div className="text-[12px]" style={{ color: "var(--koro-ash)" }}>Handle subscriptions for Pro Tier</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[12px] font-bold mb-4 flex items-center justify-between uppercase tracking-wider">
            <span>Recent Reviews</span>
          </div>
          <div className="flex flex-col gap-3">
            <div 
              className="p-4 rounded-sm flex flex-col gap-2"
              style={{ border: "1px solid var(--koro-hairline-strong)" }}
            >
              <div className="flex justify-between items-start">
                <div className="text-[13px] font-bold pr-4">PR #47: Add Multi-Tenancy Scopes</div>
                <div className="text-[11px] font-mono text-[#ff4444] font-bold mt-0.5">85%</div>
              </div>
              <div className="text-[12px]" style={{ color: "var(--koro-ash)" }}>Verdict: <span className="text-[#ff4444] font-semibold">FIX_REQUIRED</span></div>
            </div>

            <div 
              className="p-4 rounded-sm flex flex-col gap-2"
              style={{ border: "1px solid var(--koro-hairline-strong)" }}
            >
              <div className="flex justify-between items-start">
                <div className="text-[13px] font-bold pr-4">PR #45: Configure Auth Client Wrapper</div>
                <div className="text-[11px] font-mono text-[var(--koro-success)] font-bold mt-0.5">96%</div>
              </div>
              <div className="text-[12px]" style={{ color: "var(--koro-ash)" }}>Verdict: <span className="text-[var(--koro-success)] font-semibold">PASS</span></div>
            </div>

            <div 
              className="p-4 rounded-sm flex flex-col gap-2"
              style={{ border: "1px solid var(--koro-hairline-strong)" }}
            >
              <div className="flex justify-between items-start">
                <div className="text-[13px] font-bold pr-4">PR #42: Set up Database Connection</div>
                <div className="text-[11px] font-mono text-[var(--koro-success)] font-bold mt-0.5">92%</div>
              </div>
              <div className="text-[12px]" style={{ color: "var(--koro-ash)" }}>Verdict: <span className="text-[var(--koro-success)] font-semibold">PASS</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
