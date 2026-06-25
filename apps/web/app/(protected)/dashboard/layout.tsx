import React from "react";
import { UserMenu } from "./_components/user-menu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Dashboard Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--koro-hairline-strong)" }}
      >
        <div className="flex items-center gap-4">
          <div className="text-[14px] font-bold tracking-widest">KŌRO</div>
          <div
            className="hidden sm:flex items-center gap-3 text-[12px]"
            style={{ color: "var(--koro-ash)" }}
          >
            <span className="cursor-pointer hover:text-[var(--koro-on-primary)] transition-colors">Overview</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-[var(--koro-on-primary)] transition-colors">Projects</span>
            <span>/</span>
            <span className="text-[var(--koro-on-primary)] bg-[var(--koro-surface-dark-elevated)] px-2 py-0.5 rounded-sm">
              Dashboard
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[12px]">
            <span style={{ color: "var(--koro-ash)" }}>Org:</span>
            <select 
              className="bg-transparent text-[var(--koro-on-primary)] outline-none cursor-pointer font-medium"
              style={{ appearance: "none" }}
            >
              <option>Kōro Engineering</option>
              <option>Acme Corp</option>
              <option>Personal Sandbox</option>
            </select>
            <span style={{ color: "var(--koro-ash)" }}>▼</span>
          </div>
          <div
            className="hidden sm:flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-sm"
            style={{
              backgroundColor: "var(--koro-surface-dark-elevated)",
              color: "var(--koro-ash)",
            }}
          >
            <span>Search or command</span>
            <span className="opacity-50">⌘K</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="hidden md:flex flex-col gap-8 w-[220px] p-4 border-r flex-shrink-0 overflow-y-auto"
          style={{ borderColor: "var(--koro-hairline-strong)" }}
        >
          <div>
            <div
              className="text-[10px] tracking-widest uppercase mb-3"
              style={{ color: "var(--koro-ash)" }}
            >
              Navigation
            </div>
            <div className="flex flex-col gap-3 text-[12px]">
              <div className="flex items-center justify-between cursor-pointer text-[var(--koro-on-primary)] font-medium">
                <span>Dashboard</span>
              </div>
              <div className="flex items-center justify-between cursor-pointer text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors">
                <span>Projects</span>
              </div>
              <div className="flex items-center justify-between cursor-pointer text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors">
                <span>Team</span>
              </div>
              <div className="flex items-center justify-between cursor-pointer text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors">
                <span>Settings</span>
              </div>
            </div>
          </div>

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
                <span style={{ color: "var(--koro-success)" }} className="koro-animate-pulse">●</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--koro-ash)" }}>GitHub Sync</span>
                <span style={{ color: "var(--koro-success)" }}>●</span>
              </div>
            </div>
          </div>

          <UserMenu />
        </div>

        {/* Main Area */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--koro-surface-dark)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
