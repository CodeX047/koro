import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { db, eq } from "@repo/database";
import { projectsTable } from "@repo/database/schema";

export const projectRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.activeOrganizationId;
      if (!orgId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization selected" });
      }
      console.log(`Creating project ${input.name} for org ${orgId}`);
      
      const [project] = await db.insert(projectsTable).values({
        name: input.name,
        organizationId: orgId,
      }).returning();
      
      return project;
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      const orgId = ctx.activeOrganizationId;
      if (!orgId) {
        return [];
      }
      console.log(`Listing projects for org ${orgId}`);
      
      const projects = await db.select().from(projectsTable).where(eq(projectsTable.organizationId, orgId));
      return projects;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
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
