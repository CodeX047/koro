import { z } from "zod";
import { organizationProcedure, featureProcedure, router } from "../trpc";
import { checkAuthorization } from "@repo/services/security/authorize";
import { TRPCError } from "@trpc/server";
import { inngest } from "@repo/workflows/client";
import {
  getClarificationsByFeatureId,
  submitAnswer,
  skipClarification,
} from "@repo/services/clarification";
import { updateFeatureStatus } from "@repo/services/feature";

export const clarificationRouter = router({
  /** Get all clarification questions for a feature */
  list: featureProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getClarificationsByFeatureId(input.featureId);
    }),

  /** Submit answers for one or more clarification questions */
  submitAnswers: featureProcedure
    .input(
      z.object({
        featureId: z.string().uuid(),
        answers: z.array(
          z.object({
            clarificationId: z.string().uuid(),
            answer: z.string().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.answers.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "At least one answer is required",
        });
      }

      // Persist all answers in parallel
      await Promise.all(
        input.answers.map(({ clarificationId, answer }) =>
          submitAnswer(clarificationId, answer),
        ),
      );

      // Transition feature status → CLARIFICATION_COMPLETE → fire Inngest
      await updateFeatureStatus(input.featureId, "CLARIFICATION_COMPLETE");

      await inngest.send({
        name: "clarification/completed",
        data: { featureId: input.featureId },
      });

      return { success: true, featureId: input.featureId };
    }),

  /** Skip a single clarification question */
  skipQuestion: organizationProcedure
    .input(
      z.object({
        clarificationId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { db, eq } = await import("@repo/database");
      const { clarificationsTable } = await import("@repo/database/schema");
      
      const [clarification] = await db
        .select()
        .from(clarificationsTable)
        .where(eq(clarificationsTable.id, input.clarificationId))
        .limit(1);

      if (!clarification) throw new TRPCError({ code: "NOT_FOUND" });

      const isAuthorized = await checkAuthorization({
        resource: "feature",
        id: clarification.featureId,
        organizationId: ctx.activeOrganizationId!,
      });
      if (!isAuthorized) throw new TRPCError({ code: "NOT_FOUND" });

      return skipClarification(input.clarificationId);
    }),
});
