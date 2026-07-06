import { db, eq, and } from "@repo/database";
import {
  projectsTable,
  featuresTable,
  tasksTable,
  prdsTable,
  repositoriesTable,
  pullRequestsTable,
} from "@repo/database/schema";

export type ResourceType =
  | "project"
  | "feature"
  | "task"
  | "prd"
  | "repository"
  | "pull-request";

export async function checkAuthorization({
  resource,
  id,
  organizationId,
}: {
  resource: ResourceType;
  id: string;
  organizationId: string;
}): Promise<boolean> {
  if (!id || !organizationId) return false;

  switch (resource) {
    case "project": {
      const [project] = await db
        .select({ id: projectsTable.id, orgId: projectsTable.organizationId })
        .from(projectsTable)
        .where(
          and(
            eq(projectsTable.id, id)
          )
        )
        .limit(1);
      
      console.log("[authorize.ts] Project lookup:", { queryId: id, orgId: organizationId, foundProject: project });
      
      if (!project) return false;
      return project.orgId === organizationId;
    }

    case "feature": {
      const [feature] = await db
        .select({ id: featuresTable.id })
        .from(featuresTable)
        .innerJoin(projectsTable, eq(featuresTable.projectId, projectsTable.id))
        .where(
          and(
            eq(featuresTable.id, id),
            eq(projectsTable.organizationId, organizationId)
          )
        )
        .limit(1);
      return !!feature;
    }

    case "task": {
      const [task] = await db
        .select({ id: tasksTable.id })
        .from(tasksTable)
        .innerJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
        .where(
          and(
            eq(tasksTable.id, id),
            eq(projectsTable.organizationId, organizationId)
          )
        )
        .limit(1);
      return !!task;
    }

    case "prd": {
      const [prd] = await db
        .select({ id: prdsTable.id })
        .from(prdsTable)
        .innerJoin(featuresTable, eq(prdsTable.featureId, featuresTable.id))
        .innerJoin(projectsTable, eq(featuresTable.projectId, projectsTable.id))
        .where(
          and(
            eq(prdsTable.id, id),
            eq(projectsTable.organizationId, organizationId)
          )
        )
        .limit(1);
      return !!prd;
    }

    case "repository": {
      const [repo] = await db
        .select({ id: repositoriesTable.id })
        .from(repositoriesTable)
        .where(
          and(
            eq(repositoriesTable.id, id),
            eq(repositoriesTable.organizationId, organizationId)
          )
        )
        .limit(1);
      return !!repo;
    }

    case "pull-request": {
      const [pr] = await db
        .select({ id: pullRequestsTable.id })
        .from(pullRequestsTable)
        .innerJoin(repositoriesTable, eq(pullRequestsTable.repositoryId, repositoriesTable.id))
        .where(
          and(
            eq(pullRequestsTable.id, id),
            eq(repositoriesTable.organizationId, organizationId)
          )
        )
        .limit(1);
      return !!pr;
    }

    default:
      return false;
  }
}
