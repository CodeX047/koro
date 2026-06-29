"use client";

import * as React from "react";

type DashboardHeaderProps = {
  title: string;
  description?: string;
};

/**
 * Renders the dashboard page header styled according to Kōro design tokens.
 *
 * @param title - Primary heading (e.g. "GitHub App").
 * @param description - Optional subtitle shown below the title.
 */
export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header 
      className="flex h-16 shrink-0 items-center border-b px-6 mb-6"
      style={{ borderColor: "var(--koro-hairline-strong)" }}
    >
      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-base font-bold text-[var(--koro-on-primary)]">{title}</h1>
        {description ? (
          <p className="truncate text-xs text-[var(--koro-ash)] mt-1">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
