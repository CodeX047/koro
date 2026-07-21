"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Users,
  ArrowRight,
} from "lucide-react";
import { trpc } from "~/trpc/client";

function formatMsToDays(ms: number) {
  if (!ms) return "0d";
  return `${Math.round(ms / (1000 * 60 * 60 * 24))}d`;
}

export default function AnalyticsDashboardPage() {
  const { data: dashboard, isLoading: dashLoading } = trpc.analytics.dashboard.useQuery();
  const { data: insights, isLoading: insightsLoading } = trpc.analytics.insights.useQuery();
  const { data: developers, isLoading: devsLoading } = trpc.analytics.listDevelopers.useQuery();

  if (dashLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--koro-accent)]" />
      </div>
    );
  }

  if (!dashboard) {
    return <div>No analytics data available.</div>;
  }

  const velocityData = Object.entries(dashboard.velocity || {}).map(([key, value]) => ({
    metric: key.replace(/([A-Z])/g, " $1").toLowerCase(),
    count: typeof value === "number" ? value : 0,
  }));

  const throughputData = Object.entries(dashboard.throughput || {}).map(([key, value]) => ({
    metric: key.replace(/([A-Z])/g, " $1").toLowerCase(),
    count: typeof value === "number" ? value : 0,
  }));

  const healthItems = (dashboard.health || []) as any[];
  const healthStatus = healthItems.some((h) => h.level === "critical")
    ? "critical"
    : healthItems.some((h) => h.level === "warning")
      ? "warning"
      : "healthy";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--koro-on-primary)] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[var(--koro-accent)]" />
            Delivery Analytics
          </h1>
          <p className="text-[var(--koro-ash)] text-sm mt-1">
            Real-time insights into your team's engineering velocity and pipeline health.
          </p>
        </div>
        {dashboard.health && (
          <div
            className={`px-4 py-2 rounded-full border text-sm font-semibold flex items-center gap-2 ${
              healthStatus === "healthy"
                ? "bg-green-500/10 border-green-500/20 text-green-500"
                : healthStatus === "warning"
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                  : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}
          >
            {healthStatus === "healthy" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            System {healthStatus.toUpperCase()}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--koro-accent)]" />
            Avg Lead Time
          </div>
          <div className="text-3xl font-semibold text-[var(--koro-on-primary)]">
            {formatMsToDays(dashboard.averageLeadTimeMs ?? 0)}
          </div>
        </div>
        <div className="p-5 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--koro-accent)]" />
            Avg Cycle Time
          </div>
          <div className="text-3xl font-semibold text-[var(--koro-on-primary)]">
            {formatMsToDays(dashboard.averageCycleTimeMs ?? 0)}
          </div>
        </div>
        <div className="p-5 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[var(--koro-accent)]" />
            Review Success
          </div>
          <div className="text-3xl font-semibold text-[var(--koro-on-primary)]">
            {dashboard.reviewSuccessRate ?? 0}%
          </div>
        </div>
        <div className="p-5 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--koro-accent)]" />
            Features WIP
          </div>
          <div className="text-3xl font-semibold text-[var(--koro-on-primary)]">
            {dashboard.featuresInProgress}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Velocity Charts */}
          <div className="p-6 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl">
            <h3 className="text-sm font-semibold text-[var(--koro-on-primary)] mb-6 flex items-center gap-2">
              <BarChart className="w-4 h-4" /> Feature Velocity (Released / Month)
            </h3>
            <div className="h-64 w-full">
              {velocityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={velocityData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--koro-hairline-strong)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="metric"
                      stroke="var(--koro-ash)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--koro-ash)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "var(--koro-surface-dark)" }}
                      contentStyle={{
                        backgroundColor: "var(--koro-surface-dark)",
                        border: "1px solid var(--koro-hairline-strong)",
                        borderRadius: "8px",
                        textTransform: "capitalize",
                      }}
                    />
                    <Bar dataKey="count" fill="var(--koro-accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--koro-ash)]">
                  No velocity data available yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl">
            <h3 className="text-sm font-semibold text-[var(--koro-on-primary)] mb-6 flex items-center gap-2">
              <LineChart className="w-4 h-4" /> Task Throughput (Completed / Month)
            </h3>
            <div className="h-64 w-full">
              {throughputData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={throughputData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--koro-hairline-strong)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="metric"
                      stroke="var(--koro-ash)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--koro-ash)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "var(--koro-surface-dark)",
                        border: "1px solid var(--koro-hairline-strong)",
                        borderRadius: "8px",
                        textTransform: "capitalize",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#a78bfa"
                      strokeWidth={3}
                      dot={{ fill: "#a78bfa", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--koro-ash)]">
                  No throughput data available yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* AI Insights Panel */}
          <div className="p-6 bg-gradient-to-b from-[var(--koro-surface-dark-elevated)] to-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl" />
            <h3 className="text-sm font-semibold text-[var(--koro-on-primary)] mb-4 flex items-center gap-2 relative z-10">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Delivery Insights Agent
            </h3>

            {insightsLoading ? (
              <div className="flex flex-col gap-3 py-4">
                <div className="h-4 bg-[var(--koro-hairline-strong)] rounded animate-pulse w-3/4" />
                <div className="h-4 bg-[var(--koro-hairline-strong)] rounded animate-pulse w-full" />
                <div className="h-4 bg-[var(--koro-hairline-strong)] rounded animate-pulse w-5/6" />
              </div>
            ) : insights ? (
              <div className="space-y-4 relative z-10 text-sm">
                <p className="text-[var(--koro-on-primary)] leading-relaxed">{insights.summary}</p>

                {insights.bottlenecks && insights.bottlenecks.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-red-400 mb-1">Bottlenecks</h4>
                    <ul className="list-disc pl-4 text-[var(--koro-ash)] space-y-1">
                      {insights.bottlenecks.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.recommendations && insights.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-blue-400 mb-1">
                      Recommendations
                    </h4>
                    <ul className="list-disc pl-4 text-[var(--koro-ash)] space-y-1">
                      {insights.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-[var(--koro-ash)] py-4">
                Insights could not be generated.
              </div>
            )}
          </div>

          {/* Developers List */}
          <div className="p-6 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl">
            <h3 className="text-sm font-semibold text-[var(--koro-on-primary)] mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--koro-accent)]" />
              Active Developers
            </h3>
            {devsLoading ? (
              <div className="text-sm text-[var(--koro-ash)]">Loading developers...</div>
            ) : developers && developers.length > 0 ? (
              <div className="flex flex-col gap-2">
                {developers.map((dev) => (
                  <Link
                    href={`/dashboard/developers/${dev}`}
                    key={dev}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--koro-hairline)] hover:border-[var(--koro-accent)] hover:bg-[var(--koro-accent)]/5 transition-colors group"
                  >
                    <span className="text-sm font-medium text-[var(--koro-on-primary)]">{dev}</span>
                    <ArrowRight className="w-4 h-4 text-[var(--koro-ash)] group-hover:text-[var(--koro-accent)] transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[var(--koro-ash)]">
                No developer activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
