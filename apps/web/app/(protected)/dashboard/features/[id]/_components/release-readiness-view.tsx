"use client";

import React from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Rocket,
  Sparkles,
  BookOpen,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";

import { executeToastPromise } from "~/lib/toast-helpers";

export function ReleaseReadinessView({
  featureId,
  status,
  releaseRun,
  evaluateMutation,
  releaseMutation,
}: {
  featureId: string;
  status: string;
  releaseRun: any;
  evaluateMutation: any;
  releaseMutation: any;
}) {
  const isEvaluating = evaluateMutation.isPending || status === "RELEASE_PENDING";
  const isReleasing = releaseMutation.isPending || status === "RELEASE_IN_PROGRESS";
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  // Focus restoration & Escape key listener for release confirmation dialog
  React.useEffect(() => {
    if (!showConfirmDialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowConfirmDialog(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [showConfirmDialog]);

  // Score color logic
  let scoreColor = "var(--koro-danger)";
  let scoreBg = "rgba(239, 68, 68, 0.1)";
  if (releaseRun?.overallScore >= 80) {
    scoreColor = "var(--koro-success)";
    scoreBg = "rgba(34, 197, 94, 0.1)";
  } else if (releaseRun?.overallScore >= 60) {
    scoreColor = "var(--koro-warning)";
    scoreBg = "rgba(245, 158, 11, 0.1)";
  }

  const breakdownMetrics = releaseRun
    ? [
        { label: "Requirements Coverage", value: releaseRun.scoreBreakdown?.requirements ?? 0 },
        { label: "Review Health", value: releaseRun.scoreBreakdown?.reviewHealth ?? 0 },
        { label: "Tasks Completed", value: releaseRun.scoreBreakdown?.tasks ?? 0 },
        { label: "GitHub Integration", value: releaseRun.scoreBreakdown?.github ?? 0 },
        { label: "Risk Tolerance", value: releaseRun.scoreBreakdown?.risk ?? 0 },
      ]
    : [];

  return (
    <div className="mt-12 space-y-6 max-w-3xl mx-auto font-sans">
      {/* Header section */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--koro-hairline)]">
        <div>
          <h2 className="text-md font-bold" style={{ color: "var(--koro-on-primary)" }}>
            Release Readiness Evaluation
          </h2>
          <p className="text-[11px] mt-1" style={{ color: "var(--koro-ash)" }}>
            Analyze pipeline completion, safety checks, and AI production readiness.
          </p>
        </div>

        <div className="flex gap-2.5">
          {/* Evaluate Button */}
          {status !== "RELEASED" && status !== "RELEASE_IN_PROGRESS" && (
            <button
              onClick={() => {
                if (isEvaluating) return;
                executeToastPromise({
                  promise: evaluateMutation.mutateAsync({ featureId }),
                  loading: "Evaluating release readiness...",
                  success: "Release evaluation completed.",
                });
              }}
              disabled={isEvaluating}
              className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5"
              style={{
                backgroundColor: "var(--koro-surface-dark-elevated)",
                border: "1px solid var(--koro-hairline-strong)",
                color: "var(--koro-on-primary)",
              }}
            >
              {isEvaluating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              {releaseRun ? "Re-evaluate" : "Run Evaluation"}
            </button>
          )}

          {/* Release Button */}
          {(status === "READY_FOR_RELEASE" || status === "RELEASE_IN_PROGRESS") &&
            releaseRun &&
            (releaseRun.verdict === "READY" || releaseRun.verdict === "READY_WITH_WARNINGS") && (
              <button
                onClick={() => setShowConfirmDialog(true)}
                disabled={isReleasing}
                className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                style={{ backgroundColor: "var(--koro-accent)", color: "#fff" }}
              >
                {isReleasing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Rocket className="w-3.5 h-3.5" />
                )}
                Deploy to Production
              </button>
            )}
        </div>
      </div>

      {/* Evaluating loader state */}
      {isEvaluating && !releaseRun && (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            backgroundColor: "var(--koro-surface-dark-elevated)",
            border: "1px solid var(--koro-hairline-strong)",
          }}
        >
          <Loader2
            className="w-6 h-6 animate-spin mx-auto mb-3"
            style={{ color: "var(--koro-accent)" }}
          />
          <p className="text-xs font-semibold" style={{ color: "var(--koro-on-primary)" }}>
            Running Pipeline Audits…
          </p>
          <p className="text-[10px] mt-1" style={{ color: "var(--koro-ash)" }}>
            Checking connected repos, build states, pull request approvals, and compiling AI safety
            metrics.
          </p>
        </div>
      )}

      {/* Main Results panel */}
      {releaseRun && (
        <div className="space-y-6">
          {/* Top Cards: Score & Verdict */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Score Ring / Card */}
            <div
              className="rounded-xl p-6 flex flex-col items-center justify-center text-center"
              style={{
                backgroundColor: "var(--koro-surface-dark-elevated)",
                border: "1px solid var(--koro-hairline-strong)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--koro-ash)" }}
              >
                Readiness Score
              </p>

              <div
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-4"
                style={{
                  borderColor: scoreColor,
                  backgroundColor: scoreBg,
                }}
              >
                <span className="text-3xl font-black" style={{ color: "var(--koro-on-primary)" }}>
                  {releaseRun.overallScore}
                </span>
                <span
                  className="text-[9px] uppercase tracking-wider font-bold"
                  style={{ color: "var(--koro-ash)" }}
                >
                  out of 100
                </span>
              </div>

              {/* Score Breakdown progress bars */}
              <div className="w-full mt-6 space-y-2.5">
                {breakdownMetrics.map((metric) => (
                  <div key={metric.label} className="space-y-1">
                    <div
                      className="flex justify-between text-[9px] uppercase tracking-wider font-bold"
                      style={{ color: "var(--koro-ash)" }}
                    >
                      <span>{metric.label}</span>
                      <span>{metric.value}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${metric.value}%`,
                          backgroundColor:
                            metric.value >= 80
                              ? "var(--koro-success)"
                              : metric.value >= 60
                                ? "var(--koro-warning)"
                                : "var(--koro-danger)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict details Card */}
            <div
              className="rounded-xl p-6 flex flex-col justify-between"
              style={{
                backgroundColor: "var(--koro-surface-dark-elevated)",
                border: "1px solid var(--koro-hairline-strong)",
              }}
            >
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider mb-3.5"
                  style={{ color: "var(--koro-ash)" }}
                >
                  Verdict
                </p>
                <div className="mb-4">
                  {releaseRun.verdict === "READY" && (
                    <span
                      className="px-2.5 py-1 border rounded-full text-[10px] font-bold flex items-center w-max gap-1.5"
                      style={{
                        backgroundColor: "rgba(34, 197, 94, 0.08)",
                        color: "var(--koro-success)",
                        borderColor: "rgba(34, 197, 94, 0.2)",
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> READY FOR PRODUCTION
                    </span>
                  )}
                  {releaseRun.verdict === "READY_WITH_WARNINGS" && (
                    <span
                      className="px-2.5 py-1 border rounded-full text-[10px] font-bold flex items-center w-max gap-1.5"
                      style={{
                        backgroundColor: "rgba(245, 158, 11, 0.08)",
                        color: "var(--koro-warning)",
                        borderColor: "rgba(245, 158, 11, 0.2)",
                      }}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> READY WITH WARNINGS
                    </span>
                  )}
                  {releaseRun.verdict === "NOT_READY" && (
                    <span
                      className="px-2.5 py-1 border rounded-full text-[10px] font-bold flex items-center w-max gap-1.5"
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.08)",
                        color: "var(--koro-danger)",
                        borderColor: "rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5" /> BLOCKED / NOT READY
                    </span>
                  )}
                </div>
                <p
                  className="text-xs leading-relaxed font-semibold mt-1"
                  style={{ color: "var(--koro-on-primary)" }}
                >
                  Summary Analysis:
                </p>
                <p
                  className="text-[12px] leading-relaxed mt-1.5"
                  style={{ color: "var(--koro-ash)" }}
                >
                  {releaseRun.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Hard Checks section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Failed checks */}
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "var(--koro-surface-dark-elevated)",
                border: "1px solid var(--koro-hairline-strong)",
              }}
            >
              <h3
                className="text-[10px] font-bold uppercase tracking-wider mb-3.5"
                style={{ color: "var(--koro-ash)" }}
              >
                Failed Gates
              </h3>
              {releaseRun.failedChecks?.length > 0 ? (
                <ul className="space-y-2.5">
                  {releaseRun.failedChecks.map((check: string, i: number) => (
                    <li
                      key={i}
                      className="text-[11px] flex gap-2 items-start"
                      style={{ color: "var(--koro-danger)" }}
                    >
                      <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{check}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px]" style={{ color: "var(--koro-mute)" }}>
                  No failed gates. All deterministic checks passed.
                </p>
              )}
            </div>

            {/* Passed checks */}
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "var(--koro-surface-dark-elevated)",
                border: "1px solid var(--koro-hairline-strong)",
              }}
            >
              <h3
                className="text-[10px] font-bold uppercase tracking-wider mb-3.5"
                style={{ color: "var(--koro-ash)" }}
              >
                Passed Gates
              </h3>
              {releaseRun.passedChecks?.length > 0 ? (
                <ul className="space-y-2.5">
                  {releaseRun.passedChecks.map((check: string, i: number) => (
                    <li
                      key={i}
                      className="text-[11px] flex gap-2 items-start"
                      style={{ color: "var(--koro-success)" }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{check}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px]" style={{ color: "var(--koro-mute)" }}>
                  No passed gates recorded.
                </p>
              )}
            </div>
          </div>

          {/* AI Analysis Sections */}
          <div
            className="rounded-xl p-5 space-y-6"
            style={{
              backgroundColor: "var(--koro-surface-dark-elevated)",
              border: "1px solid var(--koro-hairline-strong)",
            }}
          >
            <div className="pb-3 border-b border-[var(--koro-hairline)]">
              <h3
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--koro-ash)" }}
              >
                AI Agent Verification Findings
              </h3>
            </div>

            {/* Missing Requirements */}
            {releaseRun.missingRequirements?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Unsatisfied Requirements
                  </span>
                </div>
                <ul
                  className="space-y-1.5 pl-5 list-disc text-[11px] leading-relaxed"
                  style={{ color: "var(--koro-on-primary)" }}
                >
                  {releaseRun.missingRequirements.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {releaseRun.risks?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Identified Technical Risks
                  </span>
                </div>
                <ul
                  className="space-y-1.5 pl-5 list-disc text-[11px] leading-relaxed"
                  style={{ color: "var(--koro-on-primary)" }}
                >
                  {releaseRun.risks.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {releaseRun.recommendations?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5" style={{ color: "var(--koro-accent)" }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Deployment Recommendations
                  </span>
                </div>
                <ul
                  className="space-y-1.5 pl-5 list-disc text-[11px] leading-relaxed"
                  style={{ color: "var(--koro-on-primary)" }}
                >
                  {releaseRun.recommendations.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Release Notes */}
            {releaseRun.releaseNotes?.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-1.5" style={{ color: "var(--koro-ash)" }}>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Generated Release Notes
                  </span>
                </div>
                <div
                  className="p-3.5 rounded-lg font-mono text-[10px] space-y-1.5 border"
                  style={{
                    backgroundColor: "var(--koro-surface-dark)",
                    borderColor: "var(--koro-hairline)",
                    color: "var(--koro-ash)",
                  }}
                >
                  {releaseRun.releaseNotes.map((note: string, i: number) => (
                    <p key={i}>• {note}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Confirmation Dialog Overlay */}
      {showConfirmDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-release-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="relative w-full max-w-sm rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            style={{
              backgroundColor: "var(--koro-surface-dark-elevated)",
              border: "1px solid var(--koro-hairline-strong)",
            }}
          >
            <h3
              id="confirm-release-dialog-title"
              className="text-sm font-bold mb-2"
              style={{ color: "var(--koro-on-primary)" }}
            >
              Confirm Production Release
            </h3>
            <p className="text-[11px] leading-relaxed mb-6" style={{ color: "var(--koro-ash)" }}>
              Are you sure you want to deploy this feature to production? This will update the
              feature status and trigger the production release pipeline.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "var(--koro-surface-dark)",
                  border: "1px solid var(--koro-hairline-strong)",
                  color: "var(--koro-on-primary)",
                }}
              >
                Cancel
              </button>
              <button
                disabled={isReleasing}
                onClick={() => {
                  if (isReleasing) return;
                  setShowConfirmDialog(false);
                  executeToastPromise({
                    promise: releaseMutation.mutateAsync({ featureId }),
                    loading: "Releasing feature to production...",
                    success: "Feature marked as RELEASED!",
                  });
                }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                style={{ backgroundColor: "var(--koro-accent)", color: "#fff" }}
              >
                <Rocket className="w-3 h-3" />
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
