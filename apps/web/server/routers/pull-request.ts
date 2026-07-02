import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db, eq, desc } from "@repo/database";
import { pullRequestsTable, changedFilesTable, commitsTable, developmentEventsTable, reviewRunsTable } from "@repo/database/schema";

export const pullRequestRouter = router({
  listByFeature: protectedProcedure
    .input(z.object({ featureId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(pullRequestsTable)
        .where(eq(pullRequestsTable.featureId, input.featureId))
        .orderBy(desc(pullRequestsTable.createdAt));
    }),

  details: protectedProcedure
    .input(z.object({ prId: z.string() }))
    .query(async ({ input }) => {
      const [pr] = await db
        .select()
        .from(pullRequestsTable)
        .where(eq(pullRequestsTable.id, input.prId))
        .limit(1);

      if (!pr) return null;

      const files = await db
        .select()
        .from(changedFilesTable)
        .where(eq(changedFilesTable.prId, input.prId));

      const commits = await db
        .select()
        .from(commitsTable)
        .where(eq(commitsTable.prId, input.prId))
        .orderBy(desc(commitsTable.timestamp));

      const reviewRuns = await db
        .select()
        .from(reviewRunsTable)
        .where(eq(reviewRunsTable.prId, input.prId))
        .orderBy(desc(reviewRunsTable.attempt));

      return { ...pr, files, commits, reviewRuns };
    }),

  timeline: protectedProcedure
    .input(z.object({ featureId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(developmentEventsTable)
        .where(eq(developmentEventsTable.featureId, input.featureId))
        .orderBy(desc(developmentEventsTable.createdAt));
    }),
});
