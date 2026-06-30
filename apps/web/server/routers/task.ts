import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db, eq } from "@repo/database";
import { tasksTable, prdsTable, featuresTable } from "@repo/database/schema";

export const taskRouter = router({
  list: protectedProcedure
    .input(z.object({ prdId: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log(`Listing tasks for PRD: ${input.prdId}`);
      const [prd] = await db.select().from(prdsTable).where(eq(prdsTable.id, input.prdId));
      if (!prd) return [];
      const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, prd.featureId));
      if (!feature) return [];
      
      return await db.select().from(tasksTable).where(eq(tasksTable.projectId, feature.projectId));
    }),

  updateStatus: protectedProcedure
    .input(z.object({ taskId: z.string(), status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]) }))
    .mutation(async ({ input, ctx }) => {
      console.log(`Updating task: ${input.taskId} to status: ${input.status}`);
      await db.update(tasksTable).set({ status: input.status }).where(eq(tasksTable.id, input.taskId));
      return { success: true, taskId: input.taskId, status: input.status };
    }),
});
