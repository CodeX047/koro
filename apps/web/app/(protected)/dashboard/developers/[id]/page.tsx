"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { ArrowLeft, Clock, GitMerge, CheckCircle, User, Activity } from "lucide-react";

function formatMsToDays(ms: number) {
  if (!ms) return "0d";
  return `${Math.round(ms / (1000 * 60 * 60 * 24))}d`;
}

function formatMsToHours(ms: number) {
  if (!ms) return "0h";
  return `${Math.round(ms / (1000 * 60 * 60))}h`;
}

export default function DeveloperProfilePage() {
  const { id } = useParams<{ id: string }>();
  // Handle URL-encoded IDs (like email addresses)
  const developerId = decodeURIComponent(id);

  const { data: metrics, isLoading } = trpc.analytics.developerMetrics.useQuery({ developerId });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--koro-accent)]" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6 text-center">
        <p className="text-[var(--koro-ash)]">No analytics data available for this developer.</p>
        <Link href="/dashboard/analytics" className="text-[var(--koro-accent)] hover:underline">
          Return to Analytics
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard/analytics"
          className="inline-flex items-center gap-1 text-sm text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Analytics
        </Link>
        <h1 className="text-2xl font-bold text-[var(--koro-on-primary)] flex items-center gap-2">
          <User className="w-6 h-6 text-[var(--koro-accent)]" />
          {developerId}
        </h1>
        <p className="text-[var(--koro-ash)] text-sm mt-1">
          Individual delivery performance and contribution history.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-[var(--koro-accent)]" />
            Merged PRs
          </div>
          <div className="text-3xl font-semibold text-[var(--koro-on-primary)]">
            {metrics.mergedPrs}
          </div>
        </div>
        <div className="p-5 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--koro-accent)]" />
            Avg Cycle Time
          </div>
          <div className="text-3xl font-semibold text-[var(--koro-on-primary)]">
            {formatMsToDays(metrics.averageCycleTimeMs ?? 0)}
          </div>
        </div>
        <div className="p-5 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[var(--koro-accent)]" />
            Avg Review Time
          </div>
          <div className="text-3xl font-semibold text-[var(--koro-on-primary)]">
            {formatMsToHours(metrics.averageReviewTimeMs ?? 0)}
          </div>
        </div>
        <div className="p-5 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--koro-accent)]" />
            Avg Merge Time
          </div>
          <div className="text-3xl font-semibold text-[var(--koro-on-primary)]">
            {formatMsToHours(metrics.averageMergeTimeMs ?? 0)}
          </div>
        </div>
      </div>

      <div className="bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[var(--koro-hairline-strong)]">
          <h3 className="text-sm font-semibold text-[var(--koro-on-primary)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--koro-accent)]" />
            Recent Metric History
          </h3>
        </div>
        <div className="divide-y divide-[var(--koro-hairline-strong)]">
          {metrics.recentMetrics.length > 0 ? (
            metrics.recentMetrics.map((metric: any) => (
              <div
                key={metric.id}
                className="p-4 flex items-center justify-between hover:bg-[var(--koro-surface-dark)] transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-[var(--koro-on-primary)]">
                    {metric.metricType.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-[var(--koro-ash)]">
                    Calculated on {new Date(metric.calculatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm font-mono font-bold text-[var(--koro-accent)]">
                  {formatMsToHours(metric.metricValue)}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-[var(--koro-ash)]">
              No recent metrics recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
