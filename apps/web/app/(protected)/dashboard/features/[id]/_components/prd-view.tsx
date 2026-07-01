"use client";

import React from "react";
import {
  Target,
  Ban,
  Users,
  CheckSquare,
  AlertTriangle,
  BarChart3,
  Zap,
  Clock,
  Cpu,
} from "lucide-react";

interface PrdData {
  id: string;
  title: string;
  problemStatement: string | null;
  goals: string[] | null;
  nonGoals: string[] | null;
  userStories: string[] | null;
  acceptanceCriteria: string[] | null;
  edgeCases: string[] | null;
  successMetrics: string[] | null;
  model: string | null;
  generationTimeMs: number | null;
  generatedAt: Date | string | null;
  version: number;
}

interface PrdViewProps {
  prd: PrdData;
}

function Section({
  icon,
  title,
  items,
  prose,
  accentColor,
}: {
  icon: React.ReactNode;
  title: string;
  items?: string[] | null;
  prose?: string | null;
  accentColor: string;
}) {
  if (!items?.length && !prose) return null;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: "var(--koro-surface-dark)",
        border: "1px solid var(--koro-hairline-strong)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: accentColor }}>{icon}</span>
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--koro-on-primary)" }}
        >
          {title}
        </h3>
      </div>

      {prose && (
        <p className="text-sm leading-relaxed" style={{ color: "var(--koro-ash)" }}>
          {prose}
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-relaxed" style={{ color: "var(--koro-ash)" }}>
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PrdView({ prd }: PrdViewProps) {
  const genDate = prd.generatedAt
    ? new Date(prd.generatedAt).toLocaleString()
    : null;

  return (
    <div className="space-y-4">
      {/* Meta bar */}
      <div
        className="flex flex-wrap gap-4 text-[11px] px-4 py-2.5 rounded-xl"
        style={{
          backgroundColor: "var(--koro-surface-dark)",
          border: "1px solid var(--koro-hairline-strong)",
          color: "var(--koro-ash)",
        }}
      >
        {prd.model && (
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3" />
            {prd.model.split("/").pop()}
          </span>
        )}
        {prd.generationTimeMs && (
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            {(prd.generationTimeMs / 1000).toFixed(1)}s
          </span>
        )}
        {genDate && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {genDate}
          </span>
        )}
        <span className="flex items-center gap-1.5 ml-auto font-semibold" style={{ color: "var(--koro-success)" }}>
          v{prd.version}
        </span>
      </div>

      {/* Problem statement */}
      <Section
        icon={<Zap className="w-4 h-4" />}
        title="Problem Statement"
        prose={prd.problemStatement}
        accentColor="var(--koro-accent)"
      />

      {/* Goals */}
      <Section
        icon={<Target className="w-4 h-4" />}
        title="Goals"
        items={prd.goals}
        accentColor="var(--koro-success)"
      />

      {/* Non-goals */}
      <Section
        icon={<Ban className="w-4 h-4" />}
        title="Non-Goals"
        items={prd.nonGoals}
        accentColor="var(--koro-warning)"
      />

      {/* User stories */}
      <Section
        icon={<Users className="w-4 h-4" />}
        title="User Stories"
        items={prd.userStories}
        accentColor="#a78bfa"
      />

      {/* Acceptance criteria */}
      <Section
        icon={<CheckSquare className="w-4 h-4" />}
        title="Acceptance Criteria"
        items={prd.acceptanceCriteria}
        accentColor="var(--koro-success)"
      />

      {/* Edge cases */}
      <Section
        icon={<AlertTriangle className="w-4 h-4" />}
        title="Edge Cases"
        items={prd.edgeCases}
        accentColor="var(--koro-danger)"
      />

      {/* Success metrics */}
      <Section
        icon={<BarChart3 className="w-4 h-4" />}
        title="Success Metrics"
        items={prd.successMetrics}
        accentColor="#34d399"
      />
    </div>
  );
}
