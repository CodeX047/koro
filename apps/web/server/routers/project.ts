import { z } from "zod";
import { organizationProcedure, roleProcedure, projectProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { db, eq, desc } from "@repo/database";
import {
  projectsTable,
  repositoriesTable,
  featuresTable,
  tasksTable,
} from "@repo/database/schema";
import { githubService } from "@repo/services/github";

export const projectRouter = router({
  create: roleProcedure("admin")
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        repoFullName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.activeOrganizationId;

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

      githubService
        .connectRepository(orgId, project.id, ctx.user.id, input.repoFullName)
        .catch((error) => {
          console.error("Failed to connect repository during project creation:", error);
        });

      return project;
    }),

  list: organizationProcedure.query(async ({ ctx }) => {
    const orgId = ctx.activeOrganizationId;

    const [projects, repos] = await Promise.all([
      db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.organizationId, orgId))
        .orderBy(desc(projectsTable.createdAt)),
      db.select().from(repositoriesTable).where(eq(repositoriesTable.organizationId, orgId)),
    ]);

    return projects.map((p) => {
      const pRepos = repos.filter((r) => r.projectId === p.id);
      return {
        ...p,
        repoName: pRepos.length > 0 ? `${pRepos[0]?.owner}/${pRepos[0]?.name}` : null,
      };
    });
  }),

  getById: projectProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const orgId = ctx.activeOrganizationId;

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .limit(1);

    if (project && project.organizationId !== orgId) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return project || null;
  }),

  delete: roleProcedure("admin")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.activeOrganizationId;

      const [project] = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, input.id))
        .limit(1);

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.organizationId !== orgId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      await Promise.all([
        db.delete(tasksTable).where(eq(tasksTable.projectId, input.id)),
        db.delete(featuresTable).where(eq(featuresTable.projectId, input.id)),
        db.delete(repositoriesTable).where(eq(repositoriesTable.projectId, input.id)),
      ]);

      await db.delete(projectsTable).where(eq(projectsTable.id, input.id));

      return { success: true };
    }),

  update: roleProcedure("admin")
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.activeOrganizationId;

      const [project] = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, input.id))
        .limit(1);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      if (project.organizationId !== orgId) throw new TRPCError({ code: "NOT_FOUND" });

      const [updated] = await db
        .update(projectsTable)
        .set({
          name: input.name,
          description: input.description,
        })
        .where(eq(projectsTable.id, input.id))
        .returning();

      return updated;
    }),
});
