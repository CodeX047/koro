import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { inngest } from "@repo/workflows/client";
import {
  getTasksByFeatureId,
  updateTaskStatus,
  moveTask,
  updateTask,
  getTaskById,
} from "@repo/services/task";
import { updateFeatureStatus } from "@repo/services/feature";

export const taskRouter = router({
  listByFeature: protectedProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getTasksByFeatureId(input.featureId);
    }),

  generate: protectedProcedure
    .input(z.object({ featureId: z.string().uuid(), prdId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      // Transition feature to TASKS_GENERATING
      await updateFeatureStatus(input.featureId, "TASKS_GENERATING");

      // Fire workflow
      await inngest.send({
        name: "task/generation.requested",
        data: { featureId: input.featureId, prdId: input.prdId },
      });

      return { success: true, featureId: input.featureId };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.string().uuid(),
        status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"]),
      }),
    )
    .mutation(async ({ input }) => {
      return updateTaskStatus(input.taskId, input.status);
    }),

  move: protectedProcedure
    .input(
      z.object({
        taskId: z.string().uuid(),
        status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"]),
        order: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      return moveTask(input.taskId, input.status, input.order);
    }),

  update: protectedProcedure
    .input(
      z.object({
        taskId: z.string().uuid(),
        data: z.object({
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
          complexity: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
          estimatedHours: z.number().nullable().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      return updateTask(input.taskId, input.data);
    }),

  approvePlan: protectedProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await updateFeatureStatus(input.featureId, "PLANNING_COMPLETE");

      await inngest.send({
        name: "planning/completed",
        data: { featureId: input.featureId },
      });

      return { success: true, featureId: input.featureId };
    }),
});
