import { Activity, Clock, GitMerge, Percent, Timer, Zap } from "lucide-react";

export type FeatureMetrics = {
  leadTimeMs: number | null;
  cycleTimeMs: number | null;
  reviewTimeMs: number | null;
  mergeTimeMs: number | null;
  taskCompletionTimeMs: number | null;
  featureCompletionTimeMs: number | null;
  aiReviewDurationMs: number | null;
  releaseDurationMs: number | null;
  completionPercent: number;
};

function formatDuration(ms: number | null) {
  if (ms === null) return "Pending";
  const hours = Math.round(ms / (60 * 60 * 1000));
  if (hours < 24) return `${Math.max(1, hours)}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

const cards = [
  { key: "leadTimeMs", label: "Lead Time", icon: Clock },
  { key: "cycleTimeMs", label: "Cycle Time", icon: Activity },
  { key: "reviewTimeMs", label: "Review Time", icon: Timer },
  { key: "mergeTimeMs", label: "Merge Time", icon: GitMerge },
  { key: "aiReviewDurationMs", label: "AI Review", icon: Zap },
] as const;

export function AnalyticsCards({ metrics }: { metrics: FeatureMetrics | undefined }) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map(({ key, label, icon: Icon }) => (
        <div key={key} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{label}</span>
            <Icon className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-100">
            {formatDuration(metrics[key])}
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Completion</span>
          <Percent className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="mt-2 text-lg font-bold text-slate-100">{metrics.completionPercent}%</div>
      </div>
    </div>
  );
}
