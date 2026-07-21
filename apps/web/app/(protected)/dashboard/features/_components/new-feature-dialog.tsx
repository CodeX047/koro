"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Sparkles } from "lucide-react";
import { trpc } from "~/trpc/client";
import { executeToastPromise } from "~/lib/toast-helpers";

interface NewFeatureDialogProps {
  projects: { id: string; name: string; repoName?: string | null }[];
  onClose: () => void;
}

export function NewFeatureDialog({ projects, onClose }: NewFeatureDialogProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Focus restoration & Escape key handler
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
    if (createFeature.isPending) return;
    setError(null);
    if (!projectId) {
      setError("Please select a project");
      return;
    }

    executeToastPromise({
      promise: createFeature.mutateAsync({ projectId, title, description }),
      loading: "Creating feature request & starting AI discovery...",
      success: "Feature request created! Redirecting to discovery...",
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-feature-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl rounded-2xl p-6 md:p-8 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] shadow-2xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--koro-accent)]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-8">
          <div>
            <h2
              id="new-feature-dialog-title"
              className="text-xl font-semibold text-[var(--koro-on-primary)] flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-[var(--koro-accent)]" />
              New Feature Request
            </h2>
            <p className="text-sm text-[var(--koro-ash)] mt-1.5">
              Describe what you need. AI will clarify requirements and draft a PRD automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close feature request dialog"
            className="p-2 rounded-lg bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors hover:border-[var(--koro-hairline-stronger)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-6">
          {/* Project */}
          <div className="space-y-2">
            <label
              htmlFor="feature-project"
              className="block text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)]"
            >
              Project & Repository
            </label>
            <select
              id="feature-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] text-[var(--koro-on-primary)] focus:outline-none focus:border-[var(--koro-accent)] transition-colors appearance-none cursor-pointer"
            >
              {projects.length === 0 && <option value="">No projects — create one first</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.repoName ? `(Repo: ${p.repoName})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="feature-title"
              className="block text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)]"
            >
              Feature Title
            </label>
            <input
              id="feature-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement dark mode toggle for the dashboard"
              required
              minLength={3}
              maxLength={255}
              className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] text-[var(--koro-on-primary)] placeholder:text-[var(--koro-ash)]/50 focus:outline-none focus:border-[var(--koro-accent)] transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="feature-description"
              className="block text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex justify-between"
            >
              <span>Description</span>
              <span className="font-normal normal-case opacity-70">Markdown supported</span>
            </label>
            <textarea
              id="feature-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this feature should do, who it's for, and why it matters. The more context you provide, the fewer follow-up questions the AI will ask."
              required
              minLength={10}
              rows={5}
              className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] text-[var(--koro-on-primary)] placeholder:text-[var(--koro-ash)]/50 focus:outline-none focus:border-[var(--koro-accent)] transition-colors resize-none leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] text-[var(--koro-on-primary)] hover:bg-[var(--koro-surface-dark-elevated)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createFeature.isPending || projects.length === 0}
              className="flex-[2] px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-[var(--koro-accent)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {createFeature.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Feature PRD
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
