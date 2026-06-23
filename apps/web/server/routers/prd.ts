import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const prdRouter = router({
  get: protectedProcedure
    .input(z.object({ featureRequestId: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log(`Getting PRD for feature request: ${input.featureRequestId}`);
      return {
        id: "prd-1",
        featureRequestId: input.featureRequestId,
        problemStatement: "Users need secure and reliable authentication.",
        goals: ["Integrate Better Auth", "Define workspace scoping"],
        nonGoals: ["Support legacy cookies"],
        userStories: ["As a developer, I want to scope APIs easily"],
        acceptanceCriteria: ["All APIs are scoped to activeOrganizationId"],
        edgeCases: ["No active organization selected"],
        successMetrics: ["100% of routes scoped correctly"]
      };
    }),

  generate: protectedProcedure
    .input(z.object({ featureRequestId: z.string(), title: z.string(), description: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log(`Triggering PRD generation for feature: ${input.featureRequestId}`);
      // In production, invoke workflows/generate-prd.ts
      return { status: "pending", featureRequestId: input.featureRequestId };
    }),
});
