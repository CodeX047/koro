"use client";

import React from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

type Stage = "feature" | "clarification" | "prd" | "plan" | "release" | "released";

const STAGES: { id: Stage; label: string }[] = [
  { id: "feature", label: "Feature" },
  { id: "clarification", label: "Discovery" },
  { id: "prd", label: "PRD" },
  { id: "plan", label: "Plan" },
  { id: "release", label: "Readiness" },
  { id: "released", label: "Released" },
];

function getActiveStage(status: string): Stage {
  if (status === "DRAFT") return "feature";
  if (status === "CLARIFICATION_PENDING" || status === "CLARIFICATION_COMPLETE")
    return "clarification";
  if (status === "PRD_GENERATING" || status === "PRD_READY") return "prd";
  if (
    status === "RELEASE_PENDING" ||
    status === "READY_FOR_RELEASE" ||
    status === "RELEASE_IN_PROGRESS"
  )
    return "release";
  if (status === "RELEASED") return "released";
  return "plan";
}

function isStageComplete(stage: Stage, status: string): boolean {
  if (stage === "feature") return status !== "DRAFT";

  const postClarificationStatuses = [
    "CLARIFICATION_COMPLETE",
    "PRD_GENERATING",
    "PRD_READY",
    "TASKS_GENERATING",
    "TASKS_DRAFT",
    "PLANNING_COMPLETE",
    "RELEASE_PENDING",
    "READY_FOR_RELEASE",
    "RELEASE_IN_PROGRESS",
    "RELEASED",
  ];
  if (stage === "clarification") return postClarificationStatuses.includes(status);

  const postPrdStatuses = [
    "TASKS_GENERATING",
    "TASKS_DRAFT",
    "PLANNING_COMPLETE",
    "RELEASE_PENDING",
    "READY_FOR_RELEASE",
    "RELEASE_IN_PROGRESS",
    "RELEASED",
  ];
  if (stage === "prd") return postPrdStatuses.includes(status);

  const postPlanStatuses = [
    "PLANNING_COMPLETE",
    "RELEASE_PENDING",
    "READY_FOR_RELEASE",
    "RELEASE_IN_PROGRESS",
    "RELEASED",
  ];
  if (stage === "plan") return postPlanStatuses.includes(status);

  const postReleaseStatuses = ["READY_FOR_RELEASE", "RELEASE_IN_PROGRESS", "RELEASED"];
  if (stage === "release") return postReleaseStatuses.includes(status);

  if (stage === "released") return status === "RELEASED";

  return false;
}

export function FeatureStepper({ status }: { status: string }) {
  const activeStage = getActiveStage(status);

  return (
    <div className="flex items-center gap-0">
      {STAGES.map((stage, i) => {
        const isComplete = isStageComplete(stage.id, status);
        const isActive = activeStage === stage.id;
        const isGenerating =
          (stage.id === "prd" && status === "PRD_GENERATING") ||
          (stage.id === "plan" && status === "TASKS_GENERATING");

        return (
          <React.Fragment key={stage.id}>
            {/* Stage node */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8">
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6" style={{ color: "var(--koro-success)" }} />
                ) : isGenerating ? (
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: "var(--koro-accent)" }}
                  />
                ) : (
                  <Circle
                    className="w-5 h-5"
                    style={{
                      color: isActive ? "var(--koro-accent)" : "var(--koro-hairline-strong)",
                    }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-semibold mt-1 uppercase tracking-wider"
                style={{
                  color: isActive || isComplete ? "var(--koro-on-primary)" : "var(--koro-mute)",
                }}
              >
                {stage.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STAGES.length - 1 && (
              <div
                className="flex-1 h-px mx-3 mb-4"
                style={{
                  backgroundColor: isStageComplete(stage.id, status)
                    ? "var(--koro-success)"
                    : "var(--koro-hairline-strong)",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
