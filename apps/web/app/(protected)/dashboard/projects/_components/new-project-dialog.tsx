"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { trpc } from "~/trpc/client";

export function NewProjectDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repoFullName, setRepoFullName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Fetch synced repositories
  const { data: syncedRepos = [] } = trpc.github.getSyncedRepositories.useQuery();

  const createProject = trpc.project.create.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
      onClose();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createProject.mutate({
      name,
      description,
      repoFullName: repoFullName || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--koro-surface-dark-elevated)",
          border: "1px solid var(--koro-hairline-strong)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-200">New Project</h2>
            <p className="text-[11px] mt-0.5 text-slate-400">
              Create a new workspace for your features and repositories.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-70 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-slate-400">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kōro Core API"
              required
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={{
                backgroundColor: "var(--koro-surface-dark)",
                border: "1px solid var(--koro-hairline-strong)",
                color: "var(--koro-on-primary)",
              }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-slate-400">
              Description (optional)
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

          <div>
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-slate-400">
              GitHub Repository
            </label>
            <select
              value={repoFullName}
              onChange={(e) => setRepoFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={{
                backgroundColor: "var(--koro-surface-dark)",
                border: "1px solid var(--koro-hairline-strong)",
                color: "var(--koro-on-primary)",
              }}
            >
              <option value="">Select a synced repository</option>
              {syncedRepos.map((repoName) => (
                <option key={repoName} value={repoName}>
                  {repoName}
                </option>
              ))}
            </select>
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
              disabled={createProject.isPending}
              className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: "var(--koro-accent)",
                color: "#fff",
              }}
            >
              {createProject.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              {createProject.isPending ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
