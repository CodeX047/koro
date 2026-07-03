"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, GitFork } from "lucide-react";
import { trpc } from "~/trpc/client";
import Link from "next/link";

export function NewProjectDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repoFullName, setRepoFullName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Fetch synced repositories
  const { data: syncedRepos = [], isLoading: isReposLoading } = trpc.github.getSyncedRepositories.useQuery();

  useEffect(() => {
    if (syncedRepos.length > 0 && !repoFullName) {
      const firstRepo = syncedRepos[0];
      if (firstRepo) {
        setRepoFullName(firstRepo);
      }
    }
  }, [syncedRepos, repoFullName]);

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
    if (!repoFullName) {
      setError("Please select a repository");
      return;
    }
    setError(null);
    createProject.mutate({
      name,
      description,
      repoFullName,
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

        {isReposLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            <p className="text-[11px] mt-2 text-slate-400">Loading repositories...</p>
          </div>
        ) : syncedRepos.length === 0 ? (
          <div className="flex flex-col items-center text-center py-6 px-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--koro-surface-dark)" }}>
              <GitFork className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold mb-2">No Synced Repositories</h3>
            <p className="text-[11px] text-slate-400 mb-6">
              You must first sync a GitHub repository before you can create a project.
            </p>
            <div className="flex gap-3 w-full">
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
              <Link
                href="/dashboard/repos"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--koro-accent)",
                  color: "#fff",
                }}
              >
                Go to Repositories
              </Link>
            </div>
          </div>
        ) : (
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
                required
                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                style={{
                  backgroundColor: "var(--koro-surface-dark)",
                  border: "1px solid var(--koro-hairline-strong)",
                  color: "var(--koro-on-primary)",
                }}
              >
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
        )}
      </div>
    </div>
  );
}
