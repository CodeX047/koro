import { db, eq } from "@repo/database";
import {
  featuresTable,
  projectsTable,
  pullRequestsTable,
  releaseRunsTable,
  repositoriesTable,
} from "@repo/database/schema";
import { daysBetween } from "./utils";

export type DeliveryHealthItem = {
  id: string;
  level: "healthy" | "warning" | "critical";
  title: string;
  description: string;
  resourceType: "feature" | "pull_request" | "review" | "release" | "repository";
  resourceId: string;
};

export async function getOrganizationHealth(organizationId: string): Promise<DeliveryHealthItem[]> {
  const projects = await db.select().from(projectsTable).where(eq(projectsTable.organizationId, organizationId));
  const projectIds = projects.map((project) => project.id);
  const features = (await db.select().from(featuresTable)).filter((feature) =>
    projectIds.includes(feature.projectId),
  );
  const featureIds = features.map((feature) => feature.id);
  const prs = (await db.select().from(pullRequestsTable)).filter(
    (pr) => pr.featureId && featureIds.includes(pr.featureId),
  );
  const releases = (await db.select().from(releaseRunsTable)).filter((release) =>
    featureIds.includes(release.featureId),
  );
  const repositories = await db
    .select()
    .from(repositoriesTable)
    .where(eq(repositoriesTable.organizationId, organizationId));

  const items: DeliveryHealthItem[] = [];

  for (const pr of prs) {
    const age = daysBetween(pr.createdAt);
    if (!pr.merged && pr.status !== "CLOSED" && age !== null && age > 7) {
      items.push({
        id: `long-pr-${pr.id}`,
        level: age > 14 ? "critical" : "warning",
        title: "Long-running PR",
        description: `PR #${pr.prNumber} has been open for ${Math.floor(age)} days.`,
        resourceType: "pull_request",
        resourceId: pr.id,
      });
    }

    const reviewAge = daysBetween(pr.reviewedAt ? null : pr.createdAt);
    if (pr.reviewStatus === "RUNNING" && reviewAge !== null && reviewAge > 2) {
      items.push({
        id: `slow-review-${pr.id}`,
        level: reviewAge > 4 ? "critical" : "warning",
        title: "Slow AI review",
        description: `PR #${pr.prNumber} has waited ${Math.floor(reviewAge)} days for review completion.`,
        resourceType: "review",
        resourceId: pr.id,
      });
    }
  }

  for (const feature of features) {
    const age = daysBetween(feature.createdAt);
    if (
      feature.status !== "RELEASED" &&
      feature.status !== "FAILED" &&
      age !== null &&
      age > 30
    ) {
      items.push({
        id: `blocked-feature-${feature.id}`,
        level: age > 45 ? "critical" : "warning",
        title: "Feature in progress too long",
        description: `${feature.title} has been active for ${Math.floor(age)} days.`,
        resourceType: "feature",
        resourceId: feature.id,
      });
    }

    const releaseAge = daysBetween(feature.updatedAt);
    if (feature.status === "READY_FOR_RELEASE" && releaseAge !== null && releaseAge > 7) {
      items.push({
        id: `release-waiting-${feature.id}`,
        level: releaseAge > 14 ? "critical" : "warning",
        title: "Waiting for release",
        description: `${feature.title} has been ready for release for ${Math.floor(releaseAge)} days.`,
        resourceType: "release",
        resourceId: feature.id,
      });
    }
  }

  for (const release of releases) {
    if (release.verdict === "NOT_READY") {
      items.push({
        id: `release-not-ready-${release.id}`,
        level: "warning",
        title: "Release blocked",
        description: release.summary ?? "Latest release evaluation is not ready.",
        resourceType: "release",
        resourceId: release.id,
      });
    }
  }

  for (const repository of repositories) {
    if (repository.syncStatus === "FAILED") {
      items.push({
        id: `repo-sync-${repository.id}`,
        level: "critical",
        title: "Repository sync failed",
        description: `${repository.owner}/${repository.name} needs attention.`,
        resourceType: "repository",
        resourceId: repository.id,
      });
    }
  }

  return items;
}

export async function getFeatureHealth(featureId: string) {
  const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId));
  if (!feature) return [];

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, feature.projectId));
  if (!project) return [];

  const items = await getOrganizationHealth(project.organizationId);
  return items.filter((item) => item.resourceId === featureId || item.id.includes(featureId));
}
