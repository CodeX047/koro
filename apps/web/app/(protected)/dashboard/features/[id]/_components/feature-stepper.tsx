"use client";

import React from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

type Stage = "feature" | "clarification" | "prd" | "plan";

const STAGES: { id: Stage; label: string }[] = [
  { id: "feature", label: "Feature" },
  { id: "clarification", label: "Discovery" },
  { id: "prd", label: "PRD" },
  { id: "plan", label: "Plan" },
];

function getActiveStage(status: string): Stage {
  if (status === "DRAFT") return "feature";
  if (status === "CLARIFICATION_PENDING" || status === "CLARIFICATION_COMPLETE") return "clarification";
  if (status === "PRD_GENERATING" || status === "PRD_READY") return "prd";
  return "plan";
}

function isStageComplete(stage: Stage, status: string): boolean {
  if (stage === "feature") return status !== "DRAFT";
  if (stage === "clarification")
    return (
      status === "CLARIFICATION_COMPLETE" ||
      status === "PRD_GENERATING" ||
      status === "PRD_READY" ||
      status === "TASKS_GENERATING" ||
      status === "TASKS_DRAFT" ||
      status === "PLANNING_COMPLETE"
    );
  if (stage === "prd") 
    return (
      status === "TASKS_GENERATING" || 
      status === "TASKS_DRAFT" || 
      status === "PLANNING_COMPLETE"
    );
  if (stage === "plan") return status === "PLANNING_COMPLETE";
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
                  <CheckCircle2
                    className="w-6 h-6"
                    style={{ color: "var(--koro-success)" }}
                  />
                ) : isGenerating ? (
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: "var(--koro-accent)" }}
                  />
                ) : (
                  <Circle
                    className="w-5 h-5"
                    style={{
                      color: isActive
                        ? "var(--koro-accent)"
                        : "var(--koro-hairline-strong)",
                    }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-semibold mt-1 uppercase tracking-wider"
                style={{
                  color: isActive || isComplete
                    ? "var(--koro-on-primary)"
                    : "var(--koro-mute)",
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
