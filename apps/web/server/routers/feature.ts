import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { inngest } from "@repo/workflows/client";
import { createFeature, getFeatureById, getFeaturesByProjectId } from "@repo/services/feature";

export const featureRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        title: z.string().min(3).max(255),
        description: z.string().min(10),
      }),
    )
    .mutation(async ({ input }) => {
      // 1. Persist to DB
      const feature = await createFeature({
        projectId: input.projectId,
        title: input.title,
        description: input.description,
      });

      // 2. Fire Inngest — starts the clarification → PRD pipeline
      await inngest.send({
        name: "feature/requested",
        data: {
          featureId: feature.id,
          title: feature.title,
          description: feature.description ?? "",
        },
      });

      return feature;
    }),

  get: protectedProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .query(async ({ input }) => {
      const feature = await getFeatureById(input.featureId);
      if (!feature) return null;
      return feature;
    }),

  list: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getFeaturesByProjectId(input.projectId);
    }),
});
