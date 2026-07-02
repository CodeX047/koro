import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { db, eq } from "@repo/database";
import { projectsTable, repositoriesTable } from "@repo/database/schema";

export const projectRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        repoFullName: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.activeOrganizationId;
      if (!orgId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization selected" });
      }
      console.log(`Creating project ${input.name} for org ${orgId}`);

      const [project] = await db
        .insert(projectsTable)
        .values({
          name: input.name,
          description: input.description,
          organizationId: orgId,
        })
        .returning();

      if (!project) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }

      if (input.repoFullName) {
        const { githubService } = await import("@repo/services/github");
        try {
          await githubService.connectRepository(
            orgId,
            project.id,
            ctx.session.user.id,
            input.repoFullName,
          );
        } catch (error) {
          console.error("Failed to connect repository during project creation:", error);
          // We still return the project, even if connecting the repo fails
        }
      }

      return project;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.activeOrganizationId;
    if (!orgId) {
      return [];
    }
    console.log(`Listing projects for org ${orgId}`);

    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.organizationId, orgId));
    const repos = await db
      .select()
      .from(repositoriesTable)
      .where(eq(repositoriesTable.organizationId, orgId));

    return projects.map((p) => {
      const pRepos = repos.filter((r) => r.projectId === p.id);
      return {
        ...p,
        repoName: pRepos.length > 0 ? `${pRepos[0]?.owner}/${pRepos[0]?.name}` : null,
      };
    });
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const orgId = ctx.activeOrganizationId;
    if (!orgId) return null;

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .limit(1);

    // Ensure the project belongs to the user's active org
    if (project && project.organizationId !== orgId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return project || null;
  }),
});
