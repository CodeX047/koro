import React from "react";
import { format } from "date-fns";
import {
  GitPullRequest,
  GitCommit,
  GitBranch,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Tag,
  Clock,
  Github,
  GitMerge,
} from "lucide-react";
import Link from "next/link";

interface DevelopmentEvent {
  id: string;
  eventType: string;
  actor: string | null;
  resourceType: string | null;
  resourceId: string | null;
  metadata: any;
  createdAt: string;
}

interface GithubTimelineProps {
  events: DevelopmentEvent[];
}

export function GithubTimeline({ events }: GithubTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="border border-slate-800 rounded-xl bg-slate-950 p-6">
        <p className="text-sm text-slate-400 text-center py-4">
          No development activity yet. Sync tasks to GitHub to get started.
        </p>
      </div>
    );
  }

  // Sort events chronologically (oldest first for timeline flow)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const getEventIcon = (eventType: string) => {
    if (eventType.includes("Issue")) return <AlertCircle className="w-4 h-4 text-emerald-400" />;
    if (eventType.includes("PR Opened"))
      return <GitPullRequest className="w-4 h-4 text-emerald-400" />;
    if (eventType.includes("PR Merged")) return <GitMerge className="w-4 h-4 text-purple-400" />;
    if (eventType.includes("PR Closed")) return <XCircle className="w-4 h-4 text-red-400" />;
    if (eventType.includes("PR Updated"))
      return <GitPullRequest className="w-4 h-4 text-indigo-400" />;
    if (eventType.includes("Commits Pushed"))
      return <GitCommit className="w-4 h-4 text-slate-400" />;
    if (eventType.includes("Review Approved"))
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (eventType.includes("Review Changes")) return <XCircle className="w-4 h-4 text-red-400" />;
    if (eventType.includes("Review")) return <MessageSquare className="w-4 h-4 text-yellow-400" />;
    if (eventType.includes("Branch")) return <GitBranch className="w-4 h-4 text-indigo-400" />;
    if (eventType.includes("Assigned")) return <User className="w-4 h-4 text-blue-400" />;
    if (eventType.includes("Labeled")) return <Tag className="w-4 h-4 text-pink-400" />;
    return <Github className="w-4 h-4 text-slate-400" />;
  };

  const renderEventDetails = (event: DevelopmentEvent) => {
    const meta = event.metadata || {};

    switch (event.eventType) {
      case "Issue Closed":
      case "Issue Reopened":
      case "Issue Assigned":
      case "Issue Unassigned":
      case "Issue Labeled":
      case "Issue Unlabeled":
        return (
          <div className="text-sm text-slate-300">
            {event.actor && <span className="font-semibold text-slate-200">{event.actor}</span>}{" "}
            {event.eventType.toLowerCase().replace("issue ", "")} issue{" "}
            <span className="font-mono text-slate-400">#{event.resourceId}</span>
            {meta.title && <span className="text-slate-400 ml-1">({meta.title})</span>}
            {meta.assignee && (
              <span className="ml-1">
                to <span className="font-semibold text-slate-200">{meta.assignee}</span>
              </span>
            )}
            {meta.labels && meta.labels.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {meta.labels.map((l: string) => (
                  <span
                    key={l}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"
                  >
                    {l}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case "PR Opened":
      case "PR Merged":
      case "PR Closed":
      case "PR Updated":
        return (
          <div className="text-sm text-slate-300">
            {event.actor && <span className="font-semibold text-slate-200">{event.actor}</span>}{" "}
            {event.eventType.toLowerCase().replace("pr ", "")} pull request{" "}
            <Link
              href={`/dashboard/prs/${meta.prId}`}
              className="font-mono text-indigo-400 hover:underline"
            >
              #{event.resourceId}
            </Link>
            {meta.title && <div className="mt-1 font-medium text-slate-200">{meta.title}</div>}
          </div>
        );

      case "Commits Pushed":
        return (
          <div className="text-sm text-slate-300">
            {event.actor && <span className="font-semibold text-slate-200">{event.actor}</span>}{" "}
            pushed {meta.commitCount} commit(s) to{" "}
            <span className="font-mono text-slate-400">{meta.branch}</span>
            {meta.commits && meta.commits.length > 0 && (
              <ul className="mt-2 space-y-1">
                {meta.commits.map((c: any) => (
                  <li key={c.sha} className="flex gap-2 items-center text-xs text-slate-400">
                    <span className="font-mono text-slate-500">{c.sha}</span>
                    <span className="truncate">{c.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case "PR Review Approved":
      case "PR Review Changes Requested":
      case "PR Review Submitted":
        return (
          <div className="text-sm text-slate-300">
            {event.actor && <span className="font-semibold text-slate-200">{event.actor}</span>}{" "}
            {event.eventType.includes("Approved")
              ? "approved"
              : event.eventType.includes("Changes")
                ? "requested changes on"
                : "reviewed"}{" "}
            pull request <span className="font-mono text-slate-400">#{event.resourceId}</span>
            {meta.body && (
              <div className="mt-2 text-xs text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-800">
                {meta.body}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-sm text-slate-300">
            <span className="font-semibold text-slate-200">{event.eventType}</span>
            {meta.title && <span className="text-slate-400 ml-2">{meta.title}</span>}
          </div>
        );
    }
  };

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-950 p-6">
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
        {sortedEvents.map((event) => (
          <div
            key={event.id}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
              {getEventIcon(event.eventType)}
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-800 bg-slate-900 shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-200 text-sm">{event.eventType}</h3>
                </div>
                <time className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(event.createdAt), "MMM d, h:mm a")}
                </time>
              </div>
              {renderEventDetails(event)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
