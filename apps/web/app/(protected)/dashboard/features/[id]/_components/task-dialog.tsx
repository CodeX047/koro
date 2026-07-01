"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { trpc } from "~/trpc/client";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (task.isNew) {
      createTask.mutate({
        projectId: task.projectId,
        featureId: task.featureId,
        title,
        description,
        priority,
        complexity,
        estimatedHours: estimatedHours === "" ? null : Number(estimatedHours),
        assigneeId: assigneeId === "" ? null : assigneeId,
        status: "TODO",
      });
    } else {
      updateTask.mutate({
        taskId: task.id,
        data: {
          title,
          description,
          priority,
          complexity,
          estimatedHours: estimatedHours === "" ? null : Number(estimatedHours),
          assigneeId: assigneeId === "" ? null : assigneeId,
        },
      });
    }
  };

  return (
    <div
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
          <h2 className="text-sm font-bold" style={{ color: "var(--koro-on-primary)" }}>
            Edit Task
          </h2>
          <button
            onClick={onClose}
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
                onChange={(e) => setEstimatedHours(e.target.value === "" ? "" : Number(e.target.value))}
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
