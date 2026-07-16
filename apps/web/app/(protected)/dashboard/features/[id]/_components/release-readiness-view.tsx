"use client";

import React from "react";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Play, Rocket } from "lucide-react";

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

  // Score color logic
  let scoreColor = "var(--koro-danger)";
  if (releaseRun?.overallScore >= 80) scoreColor = "var(--koro-success)";
  else if (releaseRun?.overallScore >= 60) scoreColor = "var(--koro-warning)";

  return (
    <div className="mt-12 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Release Readiness</h2>
          <p className="text-[11px] mt-1" style={{ color: "var(--koro-ash)" }}>
            Evaluate if this feature is ready for production deployment.
          </p>
        </div>

        <div className="flex gap-3">
          {/* Evaluate Button */}
          {status !== "RELEASED" && status !== "RELEASE_IN_PROGRESS" && (
            <button
              onClick={() => evaluateMutation.mutate({ featureId })}
              disabled={isEvaluating}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-2 border border-slate-700 bg-slate-900 text-slate-200"
            >
              {isEvaluating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3" />
              )}
              {releaseRun ? "Re-evaluate" : "Evaluate Release"}
            </button>
          )}

          {/* Release Button */}
          {(status === "READY_FOR_RELEASE" || status === "RELEASE_IN_PROGRESS") &&
            releaseRun &&
            (releaseRun.verdict === "READY" || releaseRun.verdict === "READY_WITH_WARNINGS") && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to release this feature?")) {
                    releaseMutation.mutate({ featureId });
                  }
                }}
                disabled={isReleasing}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: "var(--koro-accent)", color: "#fff" }}
              >
                {isReleasing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Rocket className="w-3 h-3" />
                )}
                Release Feature
              </button>
            )}
        </div>
      </div>

      {isEvaluating && !releaseRun && (
        <div className="rounded-2xl p-6 text-center border border-slate-800 bg-slate-900">
          <Loader2
            className="w-6 h-6 animate-spin mx-auto mb-3"
            style={{ color: "var(--koro-accent)" }}
          />
          <p className="text-sm font-semibold">Running Readiness Checks…</p>
        </div>
      )}

      {releaseRun && (
        <div className="space-y-6">
          {/* Top Cards: Score & Verdict */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-6 border border-slate-800 bg-slate-900 flex flex-col items-center justify-center text-center">
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "var(--koro-ash)" }}
              >
                Readiness Score
              </p>
              <div className="text-5xl font-black" style={{ color: scoreColor }}>
                {releaseRun.overallScore}
              </div>

              {/* Mini Breakdown */}
              <div
                className="w-full mt-4 space-y-2 text-[10px] uppercase tracking-wider"
                style={{ color: "var(--koro-ash)" }}
              >
                <div className="flex justify-between">
                  <span>Requirements</span>
                  <span>{releaseRun.scoreBreakdown?.requirements}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Review Health</span>
                  <span>{releaseRun.scoreBreakdown?.reviewHealth}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasks</span>
                  <span>{releaseRun.scoreBreakdown?.tasks}%</span>
                </div>
                <div className="flex justify-between">
                  <span>GitHub</span>
                  <span>{releaseRun.scoreBreakdown?.github}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk</span>
                  <span>{releaseRun.scoreBreakdown?.risk}%</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 border border-slate-800 bg-slate-900 flex flex-col justify-center">
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--koro-ash)" }}
              >
                Verdict
              </p>
              <div className="mb-4">
                {releaseRun.verdict === "READY" && (
                  <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800/50 rounded-full text-sm font-bold flex items-center w-max gap-2">
                    <CheckCircle2 className="w-4 h-4" /> READY
                  </span>
                )}
                {releaseRun.verdict === "READY_WITH_WARNINGS" && (
                  <span className="px-3 py-1 bg-amber-900/30 text-amber-400 border border-amber-800/50 rounded-full text-sm font-bold flex items-center w-max gap-2">
                    <AlertTriangle className="w-4 h-4" /> READY WITH WARNINGS
                  </span>
                )}
                {releaseRun.verdict === "NOT_READY" && (
                  <span className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-800/50 rounded-full text-sm font-bold flex items-center w-max gap-2">
                    <XCircle className="w-4 h-4" /> NOT READY
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{releaseRun.summary}</p>
            </div>
          </div>

          {/* Hard Checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-6 border border-slate-800 bg-slate-900">
              <h3
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--koro-ash)" }}
              >
                Failed Checks
              </h3>
              {releaseRun.failedChecks?.length > 0 ? (
                <ul className="space-y-2">
                  {releaseRun.failedChecks.map((check: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2 items-start text-red-400">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> {check}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">None</p>
              )}
            </div>

            <div className="rounded-2xl p-6 border border-slate-800 bg-slate-900">
              <h3
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--koro-ash)" }}
              >
                Passed Checks
              </h3>
              {releaseRun.passedChecks?.length > 0 ? (
                <ul className="space-y-2">
                  {releaseRun.passedChecks.map((check: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2 items-start text-green-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> {check}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">None</p>
              )}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="rounded-2xl p-6 border border-slate-800 bg-slate-900 space-y-6">
            {releaseRun.missingRequirements?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-amber-500">
                  Missing Requirements
                </h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-slate-300">
                  {releaseRun.missingRequirements.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {releaseRun.risks?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-amber-500">
                  Risks
                </h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-slate-300">
                  {releaseRun.risks.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {releaseRun.recommendations?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-indigo-400">
                  Recommendations
                </h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-slate-300">
                  {releaseRun.recommendations.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {releaseRun.releaseNotes?.length > 0 && (
              <div>
                <h3
                  className="text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: "var(--koro-ash)" }}
                >
                  Generated Release Notes
                </h3>
                <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 space-y-2">
                  {releaseRun.releaseNotes.map((note: string, i: number) => (
                    <p key={i}>• {note}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
