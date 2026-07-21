"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Github, Copy, ExternalLink, Check } from "lucide-react";
import { trpc } from "~/trpc/client";
import { executeToastPromise } from "~/lib/toast-helpers";

interface TaskDialogProps {
  task: any;
  onClose: () => void;
  onUpdated: () => void;
}

export function TaskDialog({ task, onClose, onUpdated }: TaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [complexity, setComplexity] = useState(task.complexity);
  const [estimatedHours, setEstimatedHours] = useState<number | "">(task.estimatedHours || "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || "");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Focus restoration & Escape key listener
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      onUpdated();
      onClose();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      onUpdated();
      onClose();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const isPending = createTask.isPending || updateTask.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    if (task.isNew) {
      executeToastPromise({
        promise: createTask.mutateAsync({
          projectId: task.projectId,
          featureId: task.featureId,
          title,
          description,
          priority,
          complexity,
          estimatedHours: estimatedHours === "" ? null : Number(estimatedHours),
          assigneeId: assigneeId === "" ? null : assigneeId,
          status: "TODO",
        }),
        loading: "Creating task...",
        success: "Task created successfully.",
      });
    } else {
      executeToastPromise({
        promise: updateTask.mutateAsync({
          taskId: task.id,
          data: {
            title,
            description,
            priority,
            complexity,
            estimatedHours: estimatedHours === "" ? null : Number(estimatedHours),
            assigneeId: assigneeId === "" ? null : assigneeId,
          },
        }),
        loading: "Saving task changes...",
        success: "Task updated successfully.",
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--koro-surface-dark-elevated)",
          border: "1px solid var(--koro-hairline-strong)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            id="task-dialog-title"
            className="text-sm font-bold"
            style={{ color: "var(--koro-on-primary)" }}
          >
            {task.isNew ? "Create Task" : "Edit Task"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close task dialog"
            className="p-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: "var(--koro-ash)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-[var(--koro-ash)]">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={{
                backgroundColor: "var(--koro-surface-dark)",
                border: "1px solid var(--koro-hairline-strong)",
                color: "var(--koro-on-primary)",
              }}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-[var(--koro-ash)]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none resize-none"
              style={{
                backgroundColor: "var(--koro-surface-dark)",
                border: "1px solid var(--koro-hairline-strong)",
                color: "var(--koro-on-primary)",
              }}
            />
          </div>

          {task.reason && (
            <div>
              <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-[var(--koro-ash)]">
                AI Reasoning
              </label>
              <div
                className="w-full px-3 py-2 rounded-lg text-[11px] leading-relaxed italic"
                style={{
                  backgroundColor: "var(--koro-surface-dark)",
                  color: "var(--koro-ash)",
                  border: "1px solid var(--koro-hairline-strong)",
                }}
              >
                {task.reason}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-[var(--koro-ash)]">
              Assignee
            </label>
            <input
              type="text"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              placeholder="e.g. user_id or team name"
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={{
                backgroundColor: "var(--koro-surface-dark)",
                border: "1px solid var(--koro-hairline-strong)",
                color: "var(--koro-on-primary)",
              }}
            />
          </div>

          {task.githubIssueUrl && (
            <div className="flex flex-col gap-4 py-4 border-t border-slate-800 mt-4">
              <div className="flex items-center justify-between">
                <a
                  href={task.githubIssueUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                >
                  <Github className="w-4 h-4" />
                  Issue #{task.githubIssueNumber}
                  <ExternalLink className="w-3 h-3" />
                </a>

                {task.githubState && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        task.githubState === "OPEN"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : task.githubState === "CLOSED"
                            ? "bg-purple-400/10 text-purple-400"
                            : task.githubState === "REVIEW"
                              ? "bg-yellow-400/10 text-yellow-400"
                              : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {task.githubState}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-slate-400">Branch Name</span>
                  <span className="font-mono text-slate-200">
                    {task.branchName ||
                      `feature/${task.id.slice(0, 8)}-${task.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const branchName =
                      task.branchName ||
                      `feature/${task.id.slice(0, 8)}-${task.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                    navigator.clipboard.writeText(branchName);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-slate-100 transition bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 shrink-0"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  Copy
                </button>
              </div>

              {task.githubUpdatedAt && (
                <div className="text-[10px] text-slate-500 text-right">
                  Last synced: {new Date(task.githubUpdatedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-[var(--koro-ash)]">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                style={{
                  backgroundColor: "var(--koro-surface-dark)",
                  border: "1px solid var(--koro-hairline-strong)",
                  color: "var(--koro-on-primary)",
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-[var(--koro-ash)]">
                Complexity
              </label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                style={{
                  backgroundColor: "var(--koro-surface-dark)",
                  border: "1px solid var(--koro-hairline-strong)",
                  color: "var(--koro-on-primary)",
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-[var(--koro-ash)]">
                Est. Hours
              </label>
              <input
                type="number"
                min="0"
                value={estimatedHours}
                onChange={(e) =>
                  setEstimatedHours(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                style={{
                  backgroundColor: "var(--koro-surface-dark)",
                  border: "1px solid var(--koro-hairline-strong)",
                  color: "var(--koro-on-primary)",
                }}
              />
            </div>
          </div>

          {error && <p className="text-[11px] text-red-400">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70"
              style={{
                backgroundColor: "var(--koro-surface-dark)",
                color: "var(--koro-ash)",
                border: "1px solid var(--koro-hairline-strong)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTask.isPending}
              className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--koro-accent)", color: "#fff" }}
            >
              {updateTask.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
