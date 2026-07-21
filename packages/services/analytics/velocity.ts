import { and, db, eq, gte } from "@repo/database";
import { average } from "./utils";
import {
  deliveryMetricsTable,
  featuresTable,
  projectsTable,
  tasksTable,
} from "@repo/database/schema";

export async function getOrganizationVelocity(
  organizationId: string,
  since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
) {
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.organizationId, organizationId));
  const projectIds = projects.map((project) => project.id);
  if (projectIds.length === 0) {
    return {
      completedFeatures: 0,
      completedTasks: 0,
      averageCycleTimeMs: null,
      averageReviewTimeMs: null,
      averageLeadTimeMs: null,
      averageDeliveryTimeMs: null,
    };
  }

  const features = await db.select().from(featuresTable);
  const orgFeatures = features.filter((feature) => projectIds.includes(feature.projectId));
  const featureIds = orgFeatures.map((feature) => feature.id);
  const tasks = await db.select().from(tasksTable);
  const metrics = await db
    .select()
    .from(deliveryMetricsTable)
    .where(
      and(
        eq(deliveryMetricsTable.organizationId, organizationId),
        gte(deliveryMetricsTable.calculatedAt, since),
      ),
    );

  return {
    completedFeatures: orgFeatures.filter((feature) => feature.status === "RELEASED").length,
    completedTasks: tasks.filter(
      (task) => task.featureId && featureIds.includes(task.featureId) && task.status === "DONE",
    ).length,
    averageCycleTimeMs: average(
      metrics.filter((m) => m.metricType === "CYCLE_TIME").map((m) => m.metricValue),
    ),
    averageReviewTimeMs: average(
      metrics.filter((m) => m.metricType === "REVIEW_TIME").map((m) => m.metricValue),
    ),
    averageLeadTimeMs: average(
      metrics.filter((m) => m.metricType === "LEAD_TIME").map((m) => m.metricValue),
    ),
    averageDeliveryTimeMs: average(
      metrics.filter((m) => m.metricType === "FEATURE_COMPLETION_TIME").map((m) => m.metricValue),
    ),
  };
}
