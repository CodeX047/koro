"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./_components/user-menu";
import { OrgSelector } from "./_components/org-selector";
import { SystemStatus } from "./_components/system-status";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const segmentMap: Record<string, string> = {
    dashboard: "Overview",
    projects: "Projects",
    repos: "Repositories",
    team: "Team",
    github: "GitHub App",
    settings: "Settings",
    billing: "Billing",
    features: "Features",
    reviews: "Reviews",
    workspace: "Workspace",
  };

  const formatSegment = (segment: string) => {
    return segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

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
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              const href = "/" + segments.slice(0, index + 1).join("/");
              const label = formatSegment(segment);

              if (isLast) {
                return (
                  <span
                    key={href}
                    className="text-[var(--koro-on-primary)] bg-[var(--koro-surface-dark-elevated)] px-2 py-0.5 rounded-sm"
                  >
                    {label}
                  </span>
                );
              }

              return (
                <React.Fragment key={href}>
                  <Link
                    href={href}
                    className="cursor-pointer hover:text-[var(--koro-on-primary)] transition-colors"
                  >
                    {label}
                  </Link>
                  <span>/</span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <OrgSelector />
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
              <Link href="/dashboard" className="flex items-center justify-between cursor-pointer text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors">
                <span>Dashboard</span>
              </Link>
              <Link href="/dashboard/projects" className="flex items-center justify-between cursor-pointer text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors">
                <span>Projects</span>
              </Link>
              <Link href="/dashboard/repos" className="flex items-center justify-between cursor-pointer text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors">
                <span>Repositories</span>
              </Link>
              <Link href="/dashboard/team" className="flex items-center justify-between cursor-pointer text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors">
                <span>Team</span>
              </Link>
              <Link href="/dashboard/github" className="flex items-center justify-between cursor-pointer text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors">
                <span>GitHub App</span>
              </Link>
              <Link href="/dashboard/settings" className="flex items-center justify-between cursor-pointer text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors">
                <span>Settings</span>
              </Link>
            </div>
          </div>

          <SystemStatus />

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
