"use client";

import React, { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Clock } from "lucide-react";
import { trpc } from "~/trpc/client";
import { FeatureStepper } from "./_components/feature-stepper";
import { ClarificationForm } from "./_components/clarification-form";
import { PrdView } from "./_components/prd-view";
import { KanbanBoard } from "./_components/kanban-board";

const POLL_STATUSES = new Set([
  "DRAFT",
  "CLARIFICATION_PENDING", // waiting for Inngest to finish saving questions
  "CLARIFICATION_COMPLETE",
  "PRD_GENERATING",
  "TASKS_GENERATING",
]);

export default function FeatureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const utils = trpc.useUtils();

  // ── Feature query (polled while pipeline is running) ──────────────────
  const {
    data: feature,
    isLoading: featureLoading,
    error: featureError,
  } = trpc.feature.get.useQuery(
    { featureId: id },
    {
      refetchInterval: (query) => {
        const status = query.state.data?.status ?? "DRAFT";
        return POLL_STATUSES.has(status) ? 2000 : false;
      },
    },
  );

  // ── PRD + clarifications query ─────────────────────────────────────────
  const { data: prdData, isLoading: prdLoading } = trpc.prd.getByFeatureId.useQuery(
    { featureId: id },
    {
      enabled: !!feature,
      refetchInterval: (query) => {
        const status = feature?.status ?? "DRAFT";
        // Poll while generating PRD or waiting for clarifications to be saved
        return status === "PRD_GENERATING" ||
          status === "CLARIFICATION_PENDING" ||
          status === "DRAFT"
          ? 2000
          : false;
      },
    },
  );

  const generateTasksMutation = trpc.task.generate.useMutation({
    onSuccess: () => {
      utils.feature.get.invalidate({ featureId: id });
    },
  });

  const retryMutation = trpc.feature.retry.useMutation({
    onSuccess: () => {
      utils.feature.get.invalidate({ featureId: id });
    },
  });

  const syncTasksMutation = trpc.task.syncToGithub.useMutation({
    onSuccess: () => {
      utils.feature.get.invalidate({ featureId: id });
      // We could add a toast here
    },
  });

  const { data: devTimeline } = trpc.pullRequest.timeline.useQuery(
    { featureId: id },
    { enabled: feature?.status === "PLANNING_COMPLETE" },
  );

  const approvePlanMutation = trpc.task.approvePlan.useMutation({
    onSuccess: () => {
      utils.feature.get.invalidate({ featureId: id });
    },
  });

  // When clarification form is submitted, immediately re-fetch feature
  const handleAnswersSubmitted = () => {
    utils.feature.get.invalidate({ featureId: id });
    utils.prd.getByFeatureId.invalidate({ featureId: id });
  };

  // ── Loading state ─────────────────────────────────────────────────────
  if (featureLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh] gap-2 text-xs"
        style={{ color: "var(--koro-ash)" }}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (featureError || !feature) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-2 text-xs text-red-400">
        <AlertCircle className="w-4 h-4" />
        Feature not found
      </div>
    );
  }

  const status = feature.status;
  const clarifications = prdData?.clarifications ?? [];
  const prd = prdData?.prd ?? null;

  return (
    <div className="min-h-screen p-6 md:p-8 font-sans" style={{ color: "var(--koro-on-primary)" }}>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back nav */}
        <Link
          href="/dashboard/features"
          className="flex items-center gap-1.5 text-[11px] transition-opacity hover:opacity-70"
          style={{ color: "var(--koro-ash)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Feature Requests
        </Link>

        {/* Feature header */}
        <div>
          <h1 className="text-xl font-bold">{feature.title}</h1>
          {feature.description && (
            <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--koro-ash)" }}>
              {feature.description}
            </p>
          )}
        </div>

        {/* Progress stepper */}
        <div
          className="px-6 py-5 rounded-2xl"
          style={{
            backgroundColor: "var(--koro-surface-dark-elevated)",
            border: "1px solid var(--koro-hairline-strong)",
          }}
        >
          <FeatureStepper status={status} />
        </div>

        {/* ── Stage: DRAFT — pipeline just started ───────────────────── */}
        {status === "DRAFT" && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              backgroundColor: "var(--koro-surface-dark-elevated)",
              border: "1px solid var(--koro-hairline-strong)",
            }}
          >
            <Loader2
              className="w-6 h-6 animate-spin mx-auto mb-3"
              style={{ color: "var(--koro-accent)" }}
            />
            <p className="text-sm font-semibold" style={{ color: "var(--koro-on-primary)" }}>
              Starting AI Discovery…
            </p>
            <p className="text-[11px] mt-1" style={{ color: "var(--koro-ash)" }}>
              The AI is evaluating your feature request. This takes a few seconds.
            </p>
          </div>
        )}

        {/* ── Stage: CLARIFICATION_PENDING — waiting for Q's to appear ── */}
        {status === "CLARIFICATION_PENDING" && clarifications.length === 0 && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              backgroundColor: "var(--koro-surface-dark-elevated)",
              border: "1px solid var(--koro-hairline-strong)",
            }}
          >
            <Loader2
              className="w-6 h-6 animate-spin mx-auto mb-3"
              style={{ color: "var(--koro-warning)" }}
            />
            <p className="text-sm font-semibold" style={{ color: "var(--koro-on-primary)" }}>
              Generating Clarification Questions…
            </p>
          </div>
        )}

        {/* ── Stage: CLARIFICATION_PENDING — questions ready to answer ── */}
        {status === "CLARIFICATION_PENDING" && clarifications.length > 0 && (
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: "var(--koro-surface-dark-elevated)",
              border: "1px solid var(--koro-hairline-strong)",
            }}
          >
            <div className="mb-5">
              <h2 className="text-sm font-bold" style={{ color: "var(--koro-on-primary)" }}>
                AI Discovery Questions
              </h2>
              <p className="text-[11px] mt-1" style={{ color: "var(--koro-ash)" }}>
                Answer these questions to help the AI write a more accurate PRD. You can skip any
                question.
              </p>
            </div>
            <ClarificationForm
              featureId={id}
              clarifications={clarifications}
              onSubmitted={handleAnswersSubmitted}
            />
          </div>
        )}

        {/* ── Stage: CLARIFICATION_COMPLETE or PRD_GENERATING ───────────── */}
        {(status === "CLARIFICATION_COMPLETE" || status === "PRD_GENERATING") && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              backgroundColor: "var(--koro-surface-dark-elevated)",
              border: "1px solid var(--koro-hairline-strong)",
            }}
          >
            <Loader2
              className="w-6 h-6 animate-spin mx-auto mb-3"
              style={{ color: "var(--koro-accent)" }}
            />
            <p className="text-sm font-semibold" style={{ color: "var(--koro-on-primary)" }}>
              Generating PRD…
            </p>
            <p className="text-[11px] mt-1" style={{ color: "var(--koro-ash)" }}>
              The AI is writing your Product Requirements Document. This usually takes 10–20
              seconds.
            </p>
            {/* Show submitted answers while waiting */}
            {clarifications.filter((c) => c.status === "ANSWERED").length > 0 && (
              <div className="mt-5 text-left space-y-3">
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--koro-ash)" }}
                >
                  Your answers
                </p>
                {clarifications
                  .filter((c) => c.status === "ANSWERED")
                  .map((c) => (
                    <div key={c.id}>
                      <p className="text-[11px] font-medium" style={{ color: "var(--koro-ash)" }}>
                        {c.question}
                      </p>
                      <p
                        className="text-[11px] mt-0.5 px-3 py-1.5 rounded-lg"
                        style={{
                          backgroundColor: "var(--koro-surface-dark)",
                          color: "var(--koro-on-primary)",
                        }}
                      >
                        {c.answer}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ── Stage: PRD_READY ──────────────────────────────────────────── */}
        {status === "PRD_READY" && prd && (
          <div className="space-y-4">
            {/* Clarification Q&A summary */}
            {clarifications.filter((c) => c.status === "ANSWERED").length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: "var(--koro-surface-dark-elevated)",
                  border: "1px solid var(--koro-hairline-strong)",
                }}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: "var(--koro-ash)" }}
                >
                  Discovery Q&amp;A
                </h2>
                <div className="space-y-3">
                  {clarifications
                    .filter((c) => c.status === "ANSWERED")
                    .map((c) => (
                      <div key={c.id}>
                        <p className="text-[11px] font-medium" style={{ color: "var(--koro-ash)" }}>
                          {c.question}
                        </p>
                        <p
                          className="text-[11px] mt-0.5"
                          style={{ color: "var(--koro-on-primary)" }}
                        >
                          {c.answer}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* PRD */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold">Generated PRD</h2>
                <button
                  onClick={() => generateTasksMutation.mutate({ featureId: id, prdId: prd.id })}
                  disabled={generateTasksMutation.isPending}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: "var(--koro-accent)", color: "#fff" }}
                >
                  {generateTasksMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Generate Engineering Plan
                </button>
              </div>
              <PrdView prd={prd as any} />
            </div>
          </div>
        )}

        {/* ── Stage: PRD_READY but PRD not loaded yet ───────────────────── */}
        {status === "PRD_READY" && !prd && prdLoading && (
          <div
            className="flex items-center justify-center gap-2 text-xs py-8"
            style={{ color: "var(--koro-ash)" }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading PRD…
          </div>
        )}

        {/* ── Stage: TASKS_GENERATING ────────────────────────────────────── */}
        {status === "TASKS_GENERATING" && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              backgroundColor: "var(--koro-surface-dark-elevated)",
              border: "1px solid var(--koro-hairline-strong)",
            }}
          >
            <Loader2
              className="w-6 h-6 animate-spin mx-auto mb-3"
              style={{ color: "var(--koro-accent)" }}
            />
            <p className="text-sm font-semibold" style={{ color: "var(--koro-on-primary)" }}>
              Generating Engineering Plan…
            </p>
            <p className="text-[11px] mt-1" style={{ color: "var(--koro-ash)" }}>
              The AI is breaking down the PRD into concrete tasks and mapping dependencies.
            </p>
          </div>
        )}
      </div>{" "}
      {/* Close max-w-3xl mx-auto space-y-8 */}
      {/* ── Stage: TASKS_DRAFT or PLANNING_COMPLETE ────────────────────── */}
      {(status === "TASKS_DRAFT" || status === "PLANNING_COMPLETE") && (
        <div className="mt-12 space-y-6 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Engineering Plan</h2>
              {status === "TASKS_DRAFT" && (
                <p className="text-[11px] mt-1" style={{ color: "var(--koro-ash)" }}>
                  Draft plan generated by AI. Drag tasks to update status, or click a task to edit
                  it before approving.
                </p>
              )}
              {status === "PLANNING_COMPLETE" && (
                <p className="text-[11px] mt-1 text-green-400">
                  Plan approved and ready for execution.
                </p>
              )}
            </div>
            {status === "TASKS_DRAFT" && (
              <button
                onClick={() => approvePlanMutation.mutate({ featureId: id })}
                disabled={approvePlanMutation.isPending}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: "var(--koro-success)", color: "#fff" }}
              >
                {approvePlanMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Approve Plan
              </button>
            )}
            {status === "PLANNING_COMPLETE" && (
              <button
                onClick={() => syncTasksMutation.mutate({ featureId: id })}
                disabled={syncTasksMutation.isPending}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-2 border border-slate-700 bg-slate-900 text-slate-200"
              >
                {syncTasksMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Sync Issues to GitHub
              </button>
            )}
          </div>

          <KanbanBoard featureId={id} projectId={feature.projectId} />

          {/* Development Timeline */}
          {status === "PLANNING_COMPLETE" && (
            <div className="mt-12 space-y-4 max-w-3xl mx-auto">
              <h2 className="text-lg font-bold">Development Timeline</h2>
              <div className="border border-slate-800 rounded-xl bg-slate-950 p-6">
                {devTimeline?.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No development activity yet. Sync tasks to GitHub to get started.
                  </p>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                    {devTimeline?.map((event: any) => (
                      <div
                        key={event.id}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                          <Clock className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-800 bg-slate-900 shadow">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-slate-200 text-sm">{event.eventType}</h3>
                            <time className="text-xs text-slate-400">
                              {new Date(event.createdAt).toLocaleDateString()}
                            </time>
                          </div>
                          <div className="text-sm text-slate-400 mt-1">
                            {event.metadata.title && (
                              <Link
                                href={`/dashboard/prs/${event.metadata.prId}`}
                                className="text-indigo-400 hover:underline"
                              >
                                #{event.metadata.prNumber} {event.metadata.title}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {/* ── Stage: FAILED ─────────────────────────────────────────────── */}
      {status === "FAILED" && (
        <div className="max-w-3xl mx-auto mt-8">
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              backgroundColor: "var(--koro-surface-dark-elevated)",
              border: "1px solid var(--koro-danger)",
            }}
          >
            <AlertCircle className="w-6 h-6 mx-auto mb-3 text-red-400" />
            <p className="text-sm font-semibold" style={{ color: "var(--koro-on-primary)" }}>
              Pipeline Failed
            </p>
            <p className="text-[11px] mt-1 mb-4" style={{ color: "var(--koro-ash)" }}>
              Something went wrong. Check the Inngest dashboard for details.
            </p>
            <button
              onClick={() => retryMutation.mutate({ featureId: id })}
              disabled={retryMutation.isPending}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
              style={{ backgroundColor: "var(--koro-accent)", color: "#fff" }}
            >
              {retryMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Rerun Generation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
