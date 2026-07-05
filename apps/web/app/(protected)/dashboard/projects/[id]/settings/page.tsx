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
        <Loader2 className="w-6 h-6 animate-spin text-[var(--koro-ash)]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 font-sans text-slate-100">
      <div className="flex flex-col gap-1 pb-4 border-b border-dashed" style={{ borderColor: "var(--koro-hairline-strong)" }}>
        <h1 className="text-[14px] font-bold flex items-center gap-2 uppercase tracking-wider" style={{ color: "var(--koro-on-primary)" }}>
          Project Settings
        </h1>
        <p className="text-[12px]" style={{ color: "var(--koro-ash)" }}>
          Manage settings for {project?.name}
        </p>
      </div>

      <div 
        className="p-6 rounded-sm space-y-4"
        style={{ 
          border: "1px solid var(--koro-hairline-strong)",
          backgroundColor: "var(--koro-surface-dark)"
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Github className="w-5 h-5 text-[var(--koro-accent)]" />
          <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "var(--koro-on-primary)" }}>GitHub Integration</h2>
        </div>
        
        {connectedRepo ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400 p-4 rounded-sm border"
              style={{ 
                backgroundColor: "rgba(0, 200, 100, 0.05)",
                borderColor: "rgba(0, 200, 100, 0.2)" 
              }}
            >
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <div>
                <p className="text-[12px] font-semibold">Connected to {connectedRepo.owner}/{connectedRepo.name}</p>
                <p className="text-[10px] opacity-80">Status: {connectedRepo.syncStatus}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              <div className="border rounded-sm p-4 text-center" style={{ backgroundColor: "var(--koro-surface-dark-elevated)", borderColor: "var(--koro-hairline-strong)" }}>
                <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--koro-ash)" }}>Repository</div>
                <div className="font-bold text-[12px] mt-1" style={{ color: "var(--koro-on-primary)" }}>Connected</div>
              </div>
              <div className="border rounded-sm p-4 text-center" style={{ backgroundColor: "var(--koro-surface-dark-elevated)", borderColor: "var(--koro-hairline-strong)" }}>
                <Clock className="w-5 h-5 text-[var(--koro-accent)] mx-auto mb-2" />
                <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--koro-ash)" }}>Last Sync</div>
                <div className="font-bold text-[12px] mt-1" style={{ color: "var(--koro-on-primary)" }}>
                  {connectedRepo.updatedAt ? new Date(connectedRepo.updatedAt).toLocaleDateString() : 'Just now'}
                </div>
              </div>
              <div className="border rounded-sm p-4 text-center" style={{ backgroundColor: "var(--koro-surface-dark-elevated)", borderColor: "var(--koro-hairline-strong)" }}>
                <GitBranch className="w-5 h-5 text-[var(--koro-accent)] mx-auto mb-2" />
                <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--koro-ash)" }}>Default Branch</div>
                <div className="font-bold text-[12px] mt-1" style={{ color: "var(--koro-on-primary)" }}>{connectedRepo.defaultBranch}</div>
              </div>
              <div className="border rounded-sm p-4 text-center" style={{ backgroundColor: "var(--koro-surface-dark-elevated)", borderColor: "var(--koro-hairline-strong)" }}>
                <GitPullRequest className="w-5 h-5 text-[var(--koro-accent)] mx-auto mb-2" />
                <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--koro-ash)" }}>Open PRs</div>
                <div className="font-bold text-[12px] mt-1" style={{ color: "var(--koro-on-primary)" }}>{connectedRepo.openPrsCount}</div>
              </div>
            </div>
            <button
              onClick={() => disconnectMutation.mutate({ projectId })}
              disabled={disconnectMutation.isPending}
              className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-sm text-[11px] font-bold border border-red-900/50 transition cursor-pointer"
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect Repository"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[12px]" style={{ color: "var(--koro-ash)" }}>Connect a GitHub repository to track development events and sync issues.</p>
            
            <div className="flex items-center gap-4">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="flex-1 rounded-sm p-2 text-xs focus:outline-none focus:border-[var(--koro-accent)] transition cursor-pointer"
                style={{ 
                  backgroundColor: "var(--koro-surface-dark-elevated)",
                  border: "1px solid var(--koro-hairline-strong)",
                  color: "var(--koro-on-primary)"
                }}
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
                className="px-3 py-2 rounded-sm text-[11px] font-bold transition disabled:opacity-50 cursor-pointer"
                style={{ 
                  backgroundColor: "var(--koro-accent)", 
                  color: "#fff"
                }}
              >
                {connectMutation.isPending ? "Connecting..." : "Connect"}
              </button>
            </div>
            
            {availableRepos?.length === 0 && (
              <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-3 rounded-sm border border-yellow-500/20 mt-4 text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>No repositories found. Make sure the Kōro GitHub App is installed and has access to your repositories.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
