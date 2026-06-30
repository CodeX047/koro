import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db, eq } from "@repo/database";
import { reviewsTable } from "@repo/database/schema";

export const reviewRouter = router({
  get: protectedProcedure
    .input(z.object({ pullRequestId: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log(`Getting AI Review for PR: ${input.pullRequestId}`);
      const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, input.pullRequestId));
      
      if (!review) return null;
      
      return {
        id: review.id,
        pullRequestId: review.projectId, 
        score: 85,
        verdict: review.status === "pending" ? "FIX_REQUIRED" : "PASS",
        summary: review.title,
        issues: []
      };
    }),

  listHistory: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log(`Listing review history for project: ${input.projectId}`);
      const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.projectId, input.projectId));
      return reviews.map(r => ({
        id: r.id,
        pullRequestNumber: 0,
        verdict: r.status,
        score: 85,
        createdAt: r.createdAt
      }));
    }),
});
