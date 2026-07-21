import { and, db, desc, eq, inArray } from "@repo/database";
import {
  deliveryMetricsTable,
  featuresTable,
  projectsTable,
  pullRequestsTable,
  releaseRunsTable,
  reviewRunsTable,
  tasksTable,
  type DeliveryMetricType,
} from "@repo/database/schema";
import { average, durationMs } from "./utils";

type MetricInsert = typeof deliveryMetricsTable.$inferInsert;

export type FeatureMetricSummary = {
  leadTimeMs: number | null;
  cycleTimeMs: number | null;
  reviewTimeMs: number | null;
  mergeTimeMs: number | null;
  taskCompletionTimeMs: number | null;
  featureCompletionTimeMs: number | null;
  aiReviewDurationMs: number | null;
  releaseDurationMs: number | null;
  completionPercent: number;
};

function metric(
  organizationId: string,
  metricType: DeliveryMetricType,
  metricValue: number | null,
  metadata: Record<string, unknown>,
  featureId?: string | null,
  repositoryId?: string | null,
  developerId?: string | null,
): MetricInsert | null {
  if (metricValue === null) return null;

  return {
    organizationId,
    repositoryId: repositoryId ?? null,
    featureId: featureId ?? null,
    developerId: developerId ?? null,
    metricType,
    metricValue,
    metadata,
    calculatedAt: new Date(),
  };
}

export async function calculateFeatureMetrics(featureId: string): Promise<FeatureMetricSummary> {
  const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId));
  if (!feature) throw new Error(`Feature ${featureId} not found`);

  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.featureId, featureId));
  const prs = await db
    .select()
    .from(pullRequestsTable)
    .where(eq(pullRequestsTable.featureId, featureId));
  const releases = await db
    .select()
    .from(releaseRunsTable)
    .where(eq(releaseRunsTable.featureId, featureId))
    .orderBy(desc(releaseRunsTable.createdAt));

  const prIds = prs.map((pr) => pr.id);
  const reviews =
    prIds.length > 0
      ? await db.select().from(reviewRunsTable).where(inArray(reviewRunsTable.prId, prIds))
      : [];

  const releasedAt = feature.status === "RELEASED" ? feature.updatedAt : null;
  const firstStartedTask = tasks
    .filter((task) => task.status !== "TODO")
    .sort((a, b) => (a.updatedAt?.getTime() ?? 0) - (b.updatedAt?.getTime() ?? 0))[0];
  const lastCompletedTask = tasks
    .filter((task) => task.completedAt)
    .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0))[0];

  const leadTimeMs = durationMs(feature.createdAt, releasedAt);
  const cycleTimeMs = average(
    prs
      .filter((pr) => pr.mergedAt)
      .map((pr) => durationMs(firstStartedTask?.updatedAt ?? pr.createdAt, pr.mergedAt)),
  );
  const reviewTimeMs = average(prs.map((pr) => durationMs(pr.createdAt, pr.reviewedAt)));
  const mergeTimeMs = average(prs.map((pr) => durationMs(pr.createdAt, pr.mergedAt)));
  const taskCompletionTimeMs = average(
    tasks.map((task) => durationMs(task.createdAt, task.completedAt)),
  );
  const featureCompletionTimeMs = durationMs(feature.createdAt, lastCompletedTask?.completedAt);
  const aiReviewDurationMs = average(reviews.map((review) => review.durationMs ?? null));
  const latestRelease = releases[0] ?? null;
  const releaseDurationMs = durationMs(latestRelease?.createdAt, releasedAt);
  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  const completionPercent =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return {
    leadTimeMs,
    cycleTimeMs,
    reviewTimeMs,
    mergeTimeMs,
    taskCompletionTimeMs,
    featureCompletionTimeMs,
    aiReviewDurationMs,
    releaseDurationMs,
    completionPercent,
  };
}

export async function recalculateFeatureMetrics(featureId: string) {
  const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId));
  if (!feature) throw new Error(`Feature ${featureId} not found`);

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, feature.projectId));
  if (!project) throw new Error(`Project ${feature.projectId} not found`);

  const prs = await db
    .select()
    .from(pullRequestsTable)
    .where(eq(pullRequestsTable.featureId, featureId));
  const summary = await calculateFeatureMetrics(featureId);
  const repositoryId = prs.find((pr) => pr.repositoryId)?.repositoryId ?? null;

  const rows = [
    metric(
      project.organizationId,
      "LEAD_TIME",
      summary.leadTimeMs,
      { unit: "ms" },
      featureId,
      repositoryId,
    ),
    metric(
      project.organizationId,
      "CYCLE_TIME",
      summary.cycleTimeMs,
      { unit: "ms" },
      featureId,
      repositoryId,
    ),
    metric(
      project.organizationId,
      "REVIEW_TIME",
      summary.reviewTimeMs,
      { unit: "ms" },
      featureId,
      repositoryId,
    ),
    metric(
      project.organizationId,
      "MERGE_TIME",
      summary.mergeTimeMs,
      { unit: "ms" },
      featureId,
      repositoryId,
    ),
    metric(
      project.organizationId,
      "TASK_COMPLETION_TIME",
      summary.taskCompletionTimeMs,
      { unit: "ms" },
      featureId,
      repositoryId,
    ),
    metric(
      project.organizationId,
      "FEATURE_COMPLETION_TIME",
      summary.featureCompletionTimeMs,
      { unit: "ms" },
      featureId,
      repositoryId,
    ),
    metric(
      project.organizationId,
      "AI_REVIEW_DURATION",
      summary.aiReviewDurationMs,
      { unit: "ms" },
      featureId,
      repositoryId,
    ),
    metric(
      project.organizationId,
      "RELEASE_DURATION",
      summary.releaseDurationMs,
      { unit: "ms" },
      featureId,
      repositoryId,
    ),
    ...prs
      .map((pr) =>
        metric(
          project.organizationId,
          "MERGE_TIME",
          durationMs(pr.createdAt, pr.mergedAt),
          { unit: "ms", prId: pr.id, prNumber: pr.prNumber },
          featureId,
          pr.repositoryId,
          pr.authorLogin,
        ),
      )
      .filter((row): row is MetricInsert => row !== null),
  ].filter((row): row is MetricInsert => row !== null);

  await db
    .delete(deliveryMetricsTable)
    .where(
      and(
        eq(deliveryMetricsTable.featureId, featureId),
        eq(deliveryMetricsTable.organizationId, project.organizationId),
      ),
    );

  if (rows.length > 0) {
    await db.insert(deliveryMetricsTable).values(rows);
  }

  return summary;
}

export async function getFeatureMetrics(featureId: string) {
  const [latestMetric] = await db
    .select()
    .from(deliveryMetricsTable)
    .where(eq(deliveryMetricsTable.featureId, featureId))
    .orderBy(desc(deliveryMetricsTable.calculatedAt))
    .limit(1);

  if (!latestMetric) {
    await recalculateFeatureMetrics(featureId);
  }

  return calculateFeatureMetrics(featureId);
}
