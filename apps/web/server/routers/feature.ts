import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const featureRouter = router({
  create: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      title: z.string(),
      description: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      console.log(`Creating feature: ${input.title} for project ${input.projectId}`);
      // In production: return featureService.create(input)
      return { id: "feature-id", title: input.title, projectId: input.projectId };
    }),

  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log(`Listing features for project: ${input.projectId}`);
      // In production: return featureService.list(input.projectId)
      return [
        {
          id: "feat-1",
          title: "Add Auth",
          description: "Integration of Better Auth",
          status: "SHIPPED",
          priority: "HIGH"
        }
      ];
    }),
});
