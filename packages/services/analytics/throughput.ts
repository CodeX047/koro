import { db, eq, gte } from "@repo/database";
import {
  featuresTable,
  projectsTable,
  pullRequestsTable,
  reviewRunsTable,
  tasksTable,
} from "@repo/database/schema";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function perWeek(count: number, since: Date) {
  const weeks = Math.max(1, (Date.now() - since.getTime()) / WEEK_MS);
  return Number((count / weeks).toFixed(1));
}

export async function getOrganizationThroughput(
  organizationId: string,
  since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
) {
  const projects = await db.select().from(projectsTable).where(eq(projectsTable.organizationId, organizationId));
  const projectIds = projects.map((project) => project.id);
  const features = await db.select().from(featuresTable).where(gte(featuresTable.createdAt, since));
  const orgFeatures = features.filter((feature) => projectIds.includes(feature.projectId));
  const featureIds = orgFeatures.map((feature) => feature.id);
  const tasks = await db.select().from(tasksTable).where(gte(tasksTable.createdAt, since));
  const orgTasks = tasks.filter((task) => task.featureId && featureIds.includes(task.featureId));
  const prs = await db.select().from(pullRequestsTable).where(gte(pullRequestsTable.createdAt, since));
  const orgPrs = prs.filter((pr) => pr.featureId && featureIds.includes(pr.featureId));
  const reviews = await db.select().from(reviewRunsTable).where(gte(reviewRunsTable.createdAt, since));
  const prIds = orgPrs.map((pr) => pr.id);

  return {
    featuresPerWeek: perWeek(orgFeatures.length, since),
    tasksPerWeek: perWeek(orgTasks.length, since),
    prsPerWeek: perWeek(orgPrs.length, since),
    reviewsPerWeek: perWeek(reviews.filter((review) => prIds.includes(review.prId)).length, since),
  };
}
