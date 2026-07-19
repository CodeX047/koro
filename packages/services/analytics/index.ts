export * from "./timeline";
export * from "./metrics";
export * from "./velocity";
export * from "./throughput";
export * from "./health";

import { and, db, desc, eq } from "@repo/database";
import {
  deliveryMetricsTable,
  featuresTable,
  projectsTable,
  pullRequestsTable,
  reviewRunsTable,
} from "@repo/database/schema";
import { getOrganizationHealth } from "./health";
import { getOrganizationThroughput } from "./throughput";
import { getOrganizationVelocity } from "./velocity";
import { average } from "./utils";

export async function getAnalyticsDashboard(organizationId: string) {
  const projects = await db.select().from(projectsTable).where(eq(projectsTable.organizationId, organizationId));
  const projectIds = projects.map((project) => project.id);
  const features = (await db.select().from(featuresTable)).filter((feature) =>
    projectIds.includes(feature.projectId),
  );
  const featureIds = features.map((feature) => feature.id);
  const prs = (await db.select().from(pullRequestsTable)).filter(
    (pr) => pr.featureId && featureIds.includes(pr.featureId),
  );
  const reviewPrIds = prs.map((pr) => pr.id);
  const reviewRuns = (await db.select().from(reviewRunsTable)).filter((run) =>
    reviewPrIds.includes(run.prId),
  );
  const latestMetrics = await db
    .select()
    .from(deliveryMetricsTable)
    .where(eq(deliveryMetricsTable.organizationId, organizationId))
    .orderBy(desc(deliveryMetricsTable.calculatedAt));
  const velocity = await getOrganizationVelocity(organizationId);
  const throughput = await getOrganizationThroughput(organizationId);
  const health = await getOrganizationHealth(organizationId);
  const successfulReviews = reviewRuns.filter((run) => run.verdict === "APPROVE").length;

  return {
    averageLeadTimeMs: average(latestMetrics.filter((m) => m.metricType === "LEAD_TIME").map((m) => m.metricValue)),
    averageCycleTimeMs: average(latestMetrics.filter((m) => m.metricType === "CYCLE_TIME").map((m) => m.metricValue)),
    featuresReleased: features.filter((feature) => feature.status === "RELEASED").length,
    featuresInProgress: features.filter(
      (feature) => feature.status !== "RELEASED" && feature.status !== "FAILED",
    ).length,
    averageAiReviewTimeMs: average(
      latestMetrics.filter((m) => m.metricType === "AI_REVIEW_DURATION").map((m) => m.metricValue),
    ),
    reviewSuccessRate:
      reviewRuns.length > 0 ? Math.round((successfulReviews / reviewRuns.length) * 100) : null,
    openPrs: prs.filter((pr) => !pr.merged && pr.status !== "CLOSED").length,
    blockedFeatures: features.filter((feature) => feature.status === "FAILED").length,
    velocity,
    throughput,
    health,
  };
}

export async function getDeveloperMetrics(organizationId: string, developerId: string) {
  const metrics = await db
    .select()
    .from(deliveryMetricsTable)
    .where(
      and(
        eq(deliveryMetricsTable.organizationId, organizationId),
        eq(deliveryMetricsTable.developerId, developerId),
      ),
    );

  return {
    developerId,
    mergedPrs: metrics.filter((metric) => metric.metricType === "MERGE_TIME").length,
    averageCycleTimeMs: average(metrics.filter((metric) => metric.metricType === "CYCLE_TIME").map((metric) => metric.metricValue)),
    averageReviewTimeMs: average(metrics.filter((metric) => metric.metricType === "REVIEW_TIME").map((metric) => metric.metricValue)),
    averageMergeTimeMs: average(metrics.filter((metric) => metric.metricType === "MERGE_TIME").map((metric) => metric.metricValue)),
    recentMetrics: metrics.sort((a, b) => b.calculatedAt.getTime() - a.calculatedAt.getTime()).slice(0, 20),
  };
}
