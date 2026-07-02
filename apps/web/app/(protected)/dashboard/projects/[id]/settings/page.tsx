"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Loader2, Github, CheckCircle, AlertCircle, Clock, GitBranch, GitPullRequest } from "lucide-react";
import { toast } from "sonner";

export default function ProjectSettingsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [selectedRepo, setSelectedRepo] = useState<string>("");

  const utils = trpc.useUtils();

  const { data: project, isLoading: projectLoading } = trpc.project.getById.useQuery({ id: projectId });
  const { data: connectedRepo, isLoading: connectedRepoLoading } = trpc.github.getConnectedRepository.useQuery({ projectId });
  const { data: availableRepos, isLoading: reposLoading } = trpc.github.listRepositories.useQuery();

  const connectMutation = trpc.github.connectRepository.useMutation({
    onSuccess: () => {
      toast.success("Repository connected successfully!");
      utils.github.getConnectedRepository.invalidate({ projectId });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to connect repository");
    }
  });

  const disconnectMutation = trpc.github.disconnectRepository.useMutation({
    onSuccess: () => {
      toast.success("Repository disconnected.");
      utils.github.getConnectedRepository.invalidate({ projectId });
    }
  });

  if (projectLoading || connectedRepoLoading || reposLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Project Settings</h1>
        <p className="text-muted-foreground">Manage settings for {project?.name}</p>
      </div>

      <div className="border rounded-xl p-6 bg-slate-950 border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <Github className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold">GitHub Integration</h2>
        </div>
        
        {connectedRepo ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-4 rounded-lg border border-green-500/20">
              <CheckCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Connected to {connectedRepo.owner}/{connectedRepo.name}</p>
                <p className="text-xs text-green-400/80">Status: {connectedRepo.syncStatus}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-xs text-slate-400">Repository</div>
                <div className="font-bold text-sm text-slate-200">Connected</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <div className="text-xs text-slate-400">Last Sync</div>
                <div className="font-bold text-sm text-slate-200">
                  {connectedRepo.updatedAt ? new Date(connectedRepo.updatedAt).toLocaleDateString() : 'Just now'}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <GitBranch className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <div className="text-xs text-slate-400">Default Branch</div>
                <div className="font-bold text-sm text-slate-200">{connectedRepo.defaultBranch}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <GitPullRequest className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <div className="text-xs text-slate-400">Open PRs</div>
                <div className="font-bold text-sm text-slate-200">{connectedRepo.openPrsCount}</div>
              </div>
            </div>
            <button
              onClick={() => disconnectMutation.mutate({ projectId })}
              disabled={disconnectMutation.isPending}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-semibold transition"
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect Repository"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Connect a GitHub repository to track development events and sync issues.</p>
            
            <div className="flex items-center gap-4">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="">Select a repository...</option>
                {availableRepos?.map((repo: any) => (
                  <option key={repo.id} value={repo.full_name}>
                    {repo.full_name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  if (selectedRepo && project) {
                    connectMutation.mutate({
                      projectId,
                      organizationId: project.organizationId,
                      repoFullName: selectedRepo
                    });
                  }
                }}
                disabled={!selectedRepo || connectMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                {connectMutation.isPending ? "Connecting..." : "Connect"}
              </button>
            </div>
            
            {availableRepos?.length === 0 && (
              <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 mt-4 text-sm">
                <AlertCircle className="w-4 h-4" />
                <p>No repositories found. Make sure the Kōro GitHub App is installed and has access to your repositories.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
