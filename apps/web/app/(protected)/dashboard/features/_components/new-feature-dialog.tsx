"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { trpc } from "~/trpc/client";

interface NewFeatureDialogProps {
  projects: { id: string; name: string }[];
  onClose: () => void;
}

export function NewFeatureDialog({ projects, onClose }: NewFeatureDialogProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createFeature = trpc.feature.create.useMutation({
    onSuccess: (feature) => {
      router.push(`/dashboard/features/${feature!.id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!projectId) {
      setError("Please select a project");
      return;
    }
    createFeature.mutate({ projectId, title, description });
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
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--koro-on-primary)" }}>
              New Feature Request
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--koro-ash)" }}>
              The AI will clarify requirements and generate a PRD automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: "var(--koro-ash)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project */}
          <div>
            <label
              htmlFor="feature-project"
              className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: "var(--koro-ash)" }}
            >
              Project
            </label>
            <select
              id="feature-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={{
                backgroundColor: "var(--koro-surface-dark)",
                border: "1px solid var(--koro-hairline-strong)",
                color: "var(--koro-on-primary)",
              }}
            >
              {projects.length === 0 && (
                <option value="">No projects — create one first</option>
              )}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="feature-title"
              className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: "var(--koro-ash)" }}
            >
              Feature Title
            </label>
            <input
              id="feature-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dark mode toggle for the dashboard"
              required
              minLength={3}
              maxLength={255}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={{
                backgroundColor: "var(--koro-surface-dark)",
                border: "1px solid var(--koro-hairline-strong)",
                color: "var(--koro-on-primary)",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="feature-description"
              className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: "var(--koro-ash)" }}
            >
              Description
            </label>
            <textarea
              id="feature-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this feature should do and why it matters. The more context you provide, the fewer follow-up questions the AI will ask."
              required
              minLength={10}
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none resize-none"
              style={{
                backgroundColor: "var(--koro-surface-dark)",
                border: "1px solid var(--koro-hairline-strong)",
                color: "var(--koro-on-primary)",
              }}
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-400">{error}</p>
          )}

          {/* Actions */}
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
              disabled={createFeature.isPending || projects.length === 0}
              className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: "var(--koro-accent)",
                color: "#fff",
              }}
            >
              {createFeature.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              {createFeature.isPending ? "Creating..." : "Create Feature →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
