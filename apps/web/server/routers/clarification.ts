import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
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
  list: protectedProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getClarificationsByFeatureId(input.featureId);
    }),

  /** Submit answers for one or more clarification questions */
  submitAnswers: protectedProcedure
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
  skipQuestion: protectedProcedure
    .input(
      z.object({
        clarificationId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      return skipClarification(input.clarificationId);
    }),
});
