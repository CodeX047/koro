import { z } from "zod";
import { featureProcedure, router } from "../trpc";
import { db, eq, desc } from "@repo/database";
import { releaseRunsTable, featuresTable } from "@repo/database/schema";
import { inngest } from "@repo/workflows/client";

export const releaseRouter = router({
  evaluate: featureProcedure
    .input(z.object({ featureId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log(`Triggering release readiness for feature: ${input.featureId}`);
      await inngest.send({
        name: "release/readiness.requested",
        data: {
          featureId: input.featureId,
          triggeredBy: ctx.user.id,
          triggerType: "manual",
        },
      });
      return { success: true };
    }),

  latest: featureProcedure.input(z.object({ featureId: z.string() })).query(async ({ input }) => {
    const [run] = await db
      .select()
      .from(releaseRunsTable)
      .where(eq(releaseRunsTable.featureId, input.featureId))
      .orderBy(desc(releaseRunsTable.createdAt))
      .limit(1);

    return run || null;
  }),

  history: featureProcedure.input(z.object({ featureId: z.string() })).query(async ({ input }) => {
    return db
      .select()
      .from(releaseRunsTable)
      .where(eq(releaseRunsTable.featureId, input.featureId))
      .orderBy(desc(releaseRunsTable.createdAt));
  }),

  release: featureProcedure
    .input(z.object({ featureId: z.string() }))
    .mutation(async ({ input }) => {
      console.log(`Releasing feature: ${input.featureId}`);
      await db
        .update(featuresTable)
        .set({ status: "RELEASE_IN_PROGRESS" })
        .where(eq(featuresTable.id, input.featureId));

      // In a real app this would trigger another workflow. For now we'll just simulate it completing.
      setTimeout(async () => {
        await db
          .update(featuresTable)
          .set({ status: "RELEASED" })
          .where(eq(featuresTable.id, input.featureId));
      }, 3000);

      return { success: true };
    }),
});
