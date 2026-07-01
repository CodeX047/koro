import { db, eq } from "@repo/database";
import { prdsTable } from "@repo/database/schema";
import type { GeneratedPRD } from "@repo/ai";

// ─── PRD Repository ──────────────────────────────────────────────────

export async function createPrd(input: {
  featureId: string;
  title: string;
  prd: GeneratedPRD;
  model: string;
  generationTimeMs: number;
}) {
  const content = prdToMarkdown(input.prd);

  const [record] = await db
    .insert(prdsTable)
    .values({
      featureId: input.featureId,
      title: input.title,
      problemStatement: input.prd.problemStatement,
      goals: input.prd.goals,
      nonGoals: input.prd.nonGoals,
      userStories: input.prd.userStories,
      acceptanceCriteria: input.prd.acceptanceCriteria,
      edgeCases: input.prd.edgeCases ?? [],
      successMetrics: input.prd.successMetrics,
      content,
      model: input.model,
      generationTimeMs: input.generationTimeMs,
      generatedAt: new Date(),
      version: 1,
    })
    .returning();

  if (!record) throw new Error("Failed to create PRD");
  return record;
}

export async function getPrdByFeatureId(featureId: string) {
  const [prd] = await db
    .select()
    .from(prdsTable)
    .where(eq(prdsTable.featureId, featureId));

  return prd ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function prdToMarkdown(prd: GeneratedPRD): string {
  const list = (items: string[]) =>
    items.map((item) => `- ${item}`).join("\n");

  return [
    "## Problem Statement",
    prd.problemStatement,
    "",
    "## Goals",
    list(prd.goals),
    "",
    "## Non-Goals",
    list(prd.nonGoals),
    "",
    "## User Stories",
    list(prd.userStories),
    "",
    "## Acceptance Criteria",
    list(prd.acceptanceCriteria),
    "",
    "## Edge Cases",
    list(prd.edgeCases ?? []),
    "",
    "## Success Metrics",
    list(prd.successMetrics),
  ].join("\n");
}
