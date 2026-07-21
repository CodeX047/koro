"use client";

import React from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Users, ArrowRight } from "lucide-react";

export default function DevelopersDirectoryPage() {
  const { data: developers, isLoading } = trpc.analytics.listDevelopers.useQuery();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--koro-on-primary)] flex items-center gap-2">
          <Users className="w-6 h-6 text-[var(--koro-accent)]" />
          Active Developers
        </h1>
        <p className="text-[var(--koro-ash)] text-sm mt-1">
          Select a developer to view their delivery metrics and performance profile.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--koro-accent)]" />
        </div>
      ) : developers && developers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {developers.map((dev) => (
            <Link
              href={`/dashboard/developers/${encodeURIComponent(dev)}`}
              key={dev}
              className="flex items-center justify-between p-5 rounded-xl border border-[var(--koro-hairline-strong)] hover:border-[var(--koro-accent)] hover:bg-[var(--koro-accent)]/5 transition-all bg-[var(--koro-surface-dark-elevated)] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline)] flex items-center justify-center text-[var(--koro-on-primary)] font-bold">
                  {dev.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[var(--koro-on-primary)]">{dev}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--koro-ash)] group-hover:text-[var(--koro-accent)] transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-[var(--koro-hairline-strong)] rounded-xl bg-[var(--koro-surface-dark-elevated)]">
          <p className="text-[var(--koro-ash)] text-sm">No developer activity recorded yet.</p>
        </div>
      )}
    </div>
  );
}
