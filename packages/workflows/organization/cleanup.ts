import { inngest } from "../client";
import { db, eq } from "@repo/database";
import { projectsTable, repositoriesTable, organizationTable } from "@repo/database/schema";
import { deletePineconeNamespace } from "@repo/services/review/vector";
import { githubService } from "@repo/services/github";

export const cleanupOrganization = inngest.createFunction(
  {
    id: "cleanup-organization",
    name: "Cleanup Organization",
    triggers: [{ event: "organization/delete.requested" }],
    retries: 3,
  },
  async ({ event, step }) => {
    const { organizationId } = event.data;

    const { projects, repositories } = await step.run("fetch-resources", async () => {
      const projects = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.organizationId, organizationId));
      const repositories = await db
        .select()
        .from(repositoriesTable)
        .where(eq(repositoriesTable.organizationId, organizationId));
      return { projects, repositories };
    });

    await step.run("cleanup-pinecone", async () => {
      for (const repo of repositories) {
        // The namespace for the codebase is typically `${repoFullName.replace("/", "--")}--codebase`
        const namespace = `${repo.owner}--${repo.name}--codebase`;
        try {
          await deletePineconeNamespace(namespace);
        } catch (e) {
          console.warn(`Failed to delete pinecone namespace ${namespace}`, e);
        }
      }
    });

    await step.run("disconnect-github", async () => {
      for (const project of projects) {
        try {
          await githubService.disconnectRepository(project.id);
        } catch (e) {
          console.warn(`Failed to disconnect github for project ${project.id}`, e);
        }
      }
    });

    await step.run("delete-database-records", async () => {
      await db.delete(projectsTable).where(eq(projectsTable.organizationId, organizationId));

      await db.delete(organizationTable).where(eq(organizationTable.id, organizationId));
    });

    return { success: true, organizationId };
  },
);
