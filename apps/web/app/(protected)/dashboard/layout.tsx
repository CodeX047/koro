"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./_components/user-menu";
import { OrgSelector } from "./_components/org-selector";
import { SystemStatus } from "./_components/system-status";
import { 
  Home, 
  FolderKanban, 
  FileCheck, 
  BookMarked, 
  Github, 
  Settings, 
  Search 
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on "/" keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const segmentMap: Record<string, string> = {
    dashboard: "Overview",
    projects: "Projects",
    repos: "Repositories",
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

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/features", label: "Features", icon: FileCheck },
    { href: "/dashboard/repos", label: "Repositories", icon: BookMarked },
    { href: "/dashboard/github", label: "GitHub App", icon: Github },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Dashboard Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--koro-hairline-strong)", backgroundColor: "var(--koro-surface-dark)" }}
      >
        <div className="flex items-center gap-4">
          <div className="text-[14px] font-bold tracking-widest text-[var(--koro-on-primary)]">KŌRO</div>
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
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="hidden md:flex flex-col gap-6 w-[240px] p-4 border-r flex-shrink-0 overflow-y-auto"
          style={{ borderColor: "var(--koro-hairline-strong)", backgroundColor: "var(--koro-surface-dark)" }}
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--koro-ash)] pointer-events-none" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-lg pl-9 pr-8 py-2 text-sm text-[var(--koro-on-primary)] placeholder:text-[var(--koro-ash)] focus:outline-none focus:border-[var(--koro-accent)] transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 text-[10px] font-medium text-[var(--koro-ash)] bg-[var(--koro-surface-dark)] rounded border border-[var(--koro-hairline-strong)] pointer-events-none">
              /
            </div>
          </div>

          <div className="flex-1">
            <div
              className="text-[10px] tracking-widest uppercase mb-3 pl-2"
              style={{ color: "var(--koro-ash)" }}
            >
              Navigation
            </div>
            <div className="flex flex-col gap-1">
              {filteredNavItems.length === 0 ? (
                <div className="text-[12px] text-[var(--koro-ash)] pl-2 py-2">
                  No results found.
                </div>
              ) : (
                filteredNavItems.map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
                  return (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? "bg-[var(--koro-surface-dark-elevated)] text-[var(--koro-on-primary)] shadow-sm" 
                          : "text-[var(--koro-ash)] hover:bg-[var(--koro-surface-dark-elevated)] hover:text-[var(--koro-on-primary)]"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? "text-[var(--koro-accent)]" : "text-[var(--koro-ash)]"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <SystemStatus />
            <UserMenu />
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--koro-surface-dark)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
