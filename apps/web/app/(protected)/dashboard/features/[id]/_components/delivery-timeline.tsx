import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Rocket,
  Sparkles,
  User,
} from "lucide-react";

export type TimelineItem = {
  type: string;
  title: string;
  description: string;
  actor: string | null;
  timestamp: string | Date;
  icon: string;
  color: "slate" | "blue" | "indigo" | "yellow" | "emerald" | "red" | "purple";
  metadata: Record<string, unknown>;
};

const iconMap = {
  feature: ClipboardList,
  document: FileText,
  issue: AlertCircle,
  user: User,
  branch: GitBranch,
  "pull-request": GitPullRequest,
  commit: GitCommit,
  merge: GitMerge,
  review: Sparkles,
  release: Rocket,
  event: CheckCircle2,
};

const colorMap = {
  slate: "text-slate-400",
  blue: "text-blue-400",
  indigo: "text-indigo-400",
  yellow: "text-yellow-400",
  emerald: "text-emerald-400",
  red: "text-red-400",
  purple: "text-purple-400",
};

export function DeliveryTimeline({ events }: { events: TimelineItem[] | undefined }) {
  if (!events || events.length === 0) {
    return (
      <div className="border border-slate-800 rounded-xl bg-slate-950 p-6">
        <p className="text-sm text-slate-400 text-center py-4">No delivery activity yet.</p>
      </div>
    );
  }

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-950 p-6">
      <div className="space-y-4">
        {events.map((event, index) => {
          const Icon = iconMap[event.icon as keyof typeof iconMap] ?? CheckCircle2;
          return (
            <div key={`${event.type}-${index}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${colorMap[event.color]}`} />
                </div>
                {index < events.length - 1 && <div className="w-px flex-1 bg-slate-800" />}
              </div>
              <div className="pb-5 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-sm font-bold text-slate-100">{event.title}</h3>
                  <time className="text-[11px] text-slate-500">
                    {format(new Date(event.timestamp), "MMM d, h:mm a")}
                  </time>
                </div>
                <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                {event.actor && <p className="text-[11px] text-slate-500 mt-1">By {event.actor}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
