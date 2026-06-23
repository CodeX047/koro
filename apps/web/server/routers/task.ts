import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const taskRouter = router({
  list: protectedProcedure
    .input(z.object({ prdId: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log(`Listing tasks for PRD: ${input.prdId}`);
      return [
        { id: "task-1", title: "Better Auth Integration", status: "IN_PROGRESS", assignee: "Vishal" },
        { id: "task-2", title: "Setup Organization Tables", status: "DONE", assignee: "Vishal" }
      ];
    }),

  updateStatus: protectedProcedure
    .input(z.object({ taskId: z.string(), status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]) }))
    .mutation(async ({ input, ctx }) => {
      console.log(`Updating task: ${input.taskId} to status: ${input.status}`);
      return { success: true, taskId: input.taskId, status: input.status };
    }),
});
