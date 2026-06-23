import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const projectRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.activeOrganizationId;
      if (!orgId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization selected" });
      }
      console.log(`Creating project ${input.name} for org ${orgId}`);
      // In production: return projectService.create({ ...input, organizationId: orgId })
      return { id: "new-project-id", name: input.name, organizationId: orgId };
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      const orgId = ctx.activeOrganizationId;
      if (!orgId) {
        return [];
      }
      console.log(`Listing projects for org ${orgId}`);
      // In production: return projectService.list(orgId)
      return [
        { id: "proj-1", name: "Project Kōro", description: "AI Platform", organizationId: orgId }
      ];
    }),
});
