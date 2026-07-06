import { z } from "zod";
import { featureProcedure, organizationProcedure, router } from "../trpc";
import { checkAuthorization } from "@repo/services/security/authorize";
import { TRPCError } from "@trpc/server";
import { db, eq, desc } from "@repo/database";
import { pullRequestsTable, changedFilesTable, commitsTable, developmentEventsTable, reviewRunsTable } from "@repo/database/schema";

export const pullRequestRouter = router({
  listByFeature: featureProcedure
    .input(z.object({ featureId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(pullRequestsTable)
        .where(eq(pullRequestsTable.featureId, input.featureId))
        .orderBy(desc(pullRequestsTable.createdAt));
    }),

  details: organizationProcedure
    .input(z.object({ prId: z.string() }))
    .query(async ({ input, ctx }) => {
      const isAuthorized = await checkAuthorization({
        resource: "pull-request",
        id: input.prId,
        organizationId: ctx.activeOrganizationId!,
      });
      if (!isAuthorized) throw new TRPCError({ code: "NOT_FOUND" });

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

  timeline: featureProcedure
    .input(z.object({ featureId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(developmentEventsTable)
        .where(eq(developmentEventsTable.featureId, input.featureId))
        .orderBy(desc(developmentEventsTable.createdAt));
    }),
});
