import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db, eq } from "@repo/database";
import { featuresTable } from "@repo/database/schema";

export const featureRouter = router({
  create: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      title: z.string(),
      description: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      console.log(`Creating feature: ${input.title} for project ${input.projectId}`);
      const [feature] = await db.insert(featuresTable).values({
        projectId: input.projectId,
        title: input.title,
        description: input.description,
      }).returning();
      return feature;
    }),

  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log(`Listing features for project: ${input.projectId}`);
      const features = await db.select().from(featuresTable).where(eq(featuresTable.projectId, input.projectId));
      return features;
    }),
});
