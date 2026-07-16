import { z } from "zod";
import { pullRequestProcedure, projectProcedure, router } from "../trpc";
import { db, eq, desc } from "@repo/database";
import { reviewRunsTable, pullRequestsTable, repositoriesTable } from "@repo/database/schema";

export const reviewRouter = router({
  get: pullRequestProcedure
    .input(z.object({ pullRequestId: z.string() }))
    .query(async ({ input }) => {
      console.log(`Getting AI Review for PR: ${input.pullRequestId}`);
      const [review] = await db
        .select()
        .from(reviewRunsTable)
        .where(eq(reviewRunsTable.prId, input.pullRequestId))
        .orderBy(desc(reviewRunsTable.createdAt))
        .limit(1);

      if (!review) return null;

      return {
        id: review.id,
        pullRequestId: review.prId,
        score: review.score ?? 0,
        verdict: review.verdict === "APPROVE" ? "PASS" : "FIX_REQUIRED",
        summary: `Review attempt ${review.attempt}`,
        issues: [],
      };
    }),

  listHistory: projectProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      console.log(`Listing review history for project: ${input.projectId}`);
      const reviews = await db
        .select({
          id: reviewRunsTable.id,
          prNumber: pullRequestsTable.prNumber,
          verdict: reviewRunsTable.verdict,
          score: reviewRunsTable.score,
          createdAt: reviewRunsTable.createdAt,
        })
        .from(reviewRunsTable)
        .innerJoin(pullRequestsTable, eq(reviewRunsTable.prId, pullRequestsTable.id))
        .innerJoin(repositoriesTable, eq(pullRequestsTable.repositoryId, repositoriesTable.id))
        .where(eq(repositoriesTable.projectId, input.projectId))
        .orderBy(desc(reviewRunsTable.createdAt));

      return reviews.map((r) => ({
        id: r.id,
        pullRequestNumber: r.prNumber,
        verdict: r.verdict === "APPROVE" ? "PASS" : "FIX_REQUIRED",
        score: r.score ?? 0,
        createdAt: r.createdAt,
      }));
    }),
});
