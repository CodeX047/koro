import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const reviewRouter = router({
  get: protectedProcedure
    .input(z.object({ pullRequestId: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log(`Getting AI Review for PR: ${input.pullRequestId}`);
      return {
        id: "rev-1",
        pullRequestId: input.pullRequestId,
        score: 85,
        verdict: "FIX_REQUIRED",
        summary: "The code looks solid but is missing Zod validation on API payloads.",
        issues: [
          { id: "iss-1", severity: "BLOCKING", title: "Missing Payload Validation", description: "Zod schemas are missing.", suggestion: "Add input Zod schema validation." }
        ]
      };
    }),

  listHistory: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log(`Listing review history for project: ${input.projectId}`);
      return [
        { id: "rev-1", pullRequestNumber: 12, verdict: "FIX_REQUIRED", score: 85, createdAt: new Date() }
      ];
    }),
});
