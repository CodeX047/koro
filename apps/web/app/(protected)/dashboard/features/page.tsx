"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileCheck, Plus, Loader2, AlertCircle } from "lucide-react";
import { trpc } from "~/trpc/client";
import { NewFeatureDialog } from "./_components/new-feature-dialog";

const STATUS_STYLES: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  DRAFT: { label: "Draft", bg: "bg-slate-500/10", text: "text-slate-400" },
  CLARIFICATION_PENDING: {
    label: "Awaiting Answers",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
  },
  CLARIFICATION_COMPLETE: {
    label: "Answers Received",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
  },
  PRD_GENERATING: {
    label: "Generating PRD…",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
  },
  PRD_READY: {
    label: "PRD Ready",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
  },
  FAILED: { label: "Failed", bg: "bg-red-500/10", text: "text-red-400" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES["DRAFT"]!;
  return (
    <span
      className={`text-[10px] px-2.5 py-0.5 ${style.bg} ${style.text} rounded-full font-bold uppercase tracking-wider`}
    >
      {style.label}
    </span>
  );
}

function FeaturesListContent({ projectId }: { projectId: string }) {
  const { data: features, isLoading, error } = trpc.feature.list.useQuery(
    { projectId },
    { refetchInterval: 3000 }, // Auto-refresh every 3s to catch status changes
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs py-8 justify-center" style={{ color: "var(--koro-ash)" }}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading features…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs py-8 justify-center text-red-400">
        <AlertCircle className="w-4 h-4" />
        Failed to load features
      </div>
    );
  }

  if (!features || features.length === 0) {
    return (
      <div className="text-center py-12">
        <FileCheck className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--koro-ash)" }} />
        <p className="text-xs font-medium" style={{ color: "var(--koro-ash)" }}>
          No feature requests yet
        </p>
        <p className="text-[11px] mt-1" style={{ color: "var(--koro-mute)" }}>
          Create your first feature and the AI will handle the rest.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y" style={{ borderColor: "var(--koro-hairline-strong)" }}>
      {features.map((feature) => (
        <Link
          key={feature.id}
          href={`/dashboard/features/${feature.id}`}
          className="flex items-center justify-between py-4 px-1 hover:opacity-80 transition-opacity group"
        >
          <div className="flex-1 min-w-0 mr-4">
            <h4 className="text-sm font-semibold truncate" style={{ color: "var(--koro-on-primary)" }}>
              {feature.title}
            </h4>
            {feature.description && (
              <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--koro-ash)" }}>
                {feature.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={feature.status} />
            {(feature.status === "PRD_GENERATING" || feature.status === "CLARIFICATION_PENDING") && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "var(--koro-ash)" }} />
            )}
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
    <div className="min-h-screen p-8 font-sans" style={{ color: "var(--koro-on-primary)" }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex justify-between items-start border-b pb-4" style={{ borderColor: "var(--koro-hairline-strong)" }}>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileCheck className="w-5 h-5" style={{ color: "var(--koro-accent)" }} />
              Feature Requests
            </h1>
            <p className="text-[11px] mt-1" style={{ color: "var(--koro-ash)" }}>
              Submit a feature → AI clarifies → generates a full PRD automatically.
            </p>
          </div>
          <button
            id="new-feature-btn"
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--koro-accent)", color: "#fff" }}
          >
            <Plus className="w-3.5 h-3.5" />
            New Request
          </button>
        </header>

        {/* Project tabs */}
        {projects.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                style={{
                  backgroundColor:
                    activeProjectId === p.id
                      ? "var(--koro-surface-dark-elevated)"
                      : "transparent",
                  color:
                    activeProjectId === p.id
                      ? "var(--koro-on-primary)"
                      : "var(--koro-ash)",
                  border: "1px solid var(--koro-hairline-strong)",
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Feature list */}
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "var(--koro-surface-dark-elevated)",
            border: "1px solid var(--koro-hairline-strong)",
          }}
        >
          {activeProjectId ? (
            <FeaturesListContent projectId={activeProjectId} />
          ) : (
            <div className="text-center py-12">
              <p className="text-xs" style={{ color: "var(--koro-ash)" }}>
                Create a project first before adding feature requests.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Feature Dialog */}
      {dialogOpen && (
        <NewFeatureDialog
          projects={projects.filter(Boolean).map((p) => ({ id: p.id, name: p.name }))}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
}
