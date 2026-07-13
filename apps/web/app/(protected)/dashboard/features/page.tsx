"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileCheck, Plus, Loader2, AlertCircle, ChevronRight, FileText } from "lucide-react";
import { trpc } from "~/trpc/client";
import { NewFeatureDialog } from "./_components/new-feature-dialog";
import { cn } from "~/lib/utils";

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  DRAFT: {
    label: "Draft",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
  },
  CLARIFICATION_PENDING: {
    label: "Awaiting Answers",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
  },
  CLARIFICATION_COMPLETE: {
    label: "Answers Received",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
  },
  PRD_GENERATING: {
    label: "Generating PRD…",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  PRD_READY: {
    label: "PRD Ready",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
  },
  FAILED: {
    label: "Failed",
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/20",
  },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES["DRAFT"]!;
  return (
    <span
      className={cn(
        "text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border",
        style.bg,
        style.text,
        style.border,
      )}
    >
      {style.label}
    </span>
  );
}

function FeaturesListContent({ projectId }: { projectId: string }) {
  const {
    data: features,
    isLoading,
    error,
  } = trpc.feature.list.useQuery(
    { projectId },
    { refetchInterval: 3000 }, // Auto-refresh every 3s to catch status changes
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl">
        <Loader2 className="w-8 h-8 text-[var(--koro-accent)] animate-spin mb-4" />
        <p className="text-[var(--koro-ash)] text-sm">Loading features...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-red-500">
        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
        <p>Failed to load features: {error.message}</p>
      </div>
    );
  }

  if (!features || features.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-[var(--koro-hairline-strong)] rounded-xl bg-[var(--koro-surface-dark-elevated)]">
        <FileCheck className="w-12 h-12 text-[var(--koro-ash)] opacity-50 mb-4" />
        <h3 className="text-lg font-medium text-[var(--koro-on-primary)] mb-2">
          No feature requests yet
        </h3>
        <p className="text-[var(--koro-ash)] text-sm max-w-sm mb-6">
          Create your first feature and let the AI automatically generate a PRD for you.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {features.map((feature) => (
        <Link
          key={feature.id}
          href={`/dashboard/features/${feature.id}`}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl hover:border-[var(--koro-hairline-stronger)] transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] rounded-lg text-[var(--koro-on-primary)] shrink-0 mt-1">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-[var(--koro-on-primary)] group-hover:text-[var(--koro-accent)] transition-colors mb-1.5">
                {feature.title}
              </h4>
              {feature.description && (
                <p className="text-sm text-[var(--koro-ash)] line-clamp-2 max-w-2xl leading-relaxed">
                  {feature.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 pl-14 sm:pl-0">
            <div className="flex items-center gap-2">
              {(feature.status === "PRD_GENERATING" ||
                feature.status === "CLARIFICATION_PENDING") && (
                <Loader2 className="w-4 h-4 animate-spin text-[var(--koro-accent)]" />
              )}
              <StatusBadge status={feature.status} />
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--koro-ash)] group-hover:text-[var(--koro-on-primary)] transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function FeaturesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const { data: projects = [] } = trpc.project.list.useQuery();

  // Show first project's features by default
  const activeProjectId = selectedProjectId || projects[0]?.id;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[var(--koro-hairline-strong)]">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--koro-on-primary)] flex items-center gap-3">
            <FileCheck className="w-6 h-6 text-[var(--koro-accent)]" />
            Feature Requests
          </h1>
          <p className="text-[var(--koro-ash)] mt-2 text-sm max-w-2xl">
            Submit a feature request, let AI clarify the requirements, and generate a full PRD
            automatically.
          </p>
        </div>
        <button
          id="new-feature-btn"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg bg-[var(--koro-accent)] hover:opacity-90 text-black transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Project tabs */}
      {projects.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                activeProjectId === p.id
                  ? "bg-[var(--koro-surface-dark-elevated)] text-[var(--koro-on-primary)] border-[var(--koro-hairline-stronger)]"
                  : "bg-transparent text-[var(--koro-ash)] border-[var(--koro-hairline-strong)] hover:border-[var(--koro-hairline-stronger)] hover:text-[var(--koro-on-primary)]",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Feature list */}
      <div>
        {activeProjectId ? (
          <FeaturesListContent projectId={activeProjectId} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-[var(--koro-hairline-strong)] rounded-xl bg-[var(--koro-surface-dark-elevated)]">
            <FileCheck className="w-12 h-12 text-[var(--koro-ash)] opacity-50 mb-4" />
            <p className="text-[var(--koro-on-primary)] font-medium text-lg mb-2">
              No projects found
            </p>
            <p className="text-[var(--koro-ash)] text-sm max-w-sm mb-6">
              Create a project first before adding feature requests.
            </p>
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] hover:border-[var(--koro-hairline-stronger)] text-[var(--koro-on-primary)] transition-colors"
            >
              Go to Projects
            </Link>
          </div>
        )}
      </div>

      {/* New Feature Dialog */}
      {dialogOpen && (
        <NewFeatureDialog
          projects={projects
            .filter(Boolean)
            .map((p) => ({ id: p.id, name: p.name, repoName: p.repoName }))}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
}
