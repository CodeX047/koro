import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export type HealthItem = {
  id: string;
  level: "healthy" | "warning" | "critical";
  title: string;
  description: string;
};

export function HealthIndicators({ items }: { items: HealthItem[] | undefined }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4 flex items-center gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-emerald-100">Healthy</div>
          <div className="text-xs text-emerald-200/70">No delivery risks detected.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const critical = item.level === "critical";
        const Icon = critical ? XCircle : AlertTriangle;
        return (
          <div
            key={item.id}
            className={`rounded-xl border p-4 flex items-start gap-3 ${
              critical
                ? "border-red-900/70 bg-red-950/20"
                : "border-yellow-900/70 bg-yellow-950/20"
            }`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${critical ? "text-red-400" : "text-yellow-400"}`} />
            <div>
              <div className={`text-sm font-semibold ${critical ? "text-red-100" : "text-yellow-100"}`}>
                {item.title}
              </div>
              <div className={`text-xs ${critical ? "text-red-200/70" : "text-yellow-200/70"}`}>
                {item.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
