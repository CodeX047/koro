import { inngest } from "../client";
import { db, eq } from "@repo/database";
import { tasksTable, featuresTable } from "@repo/database/schema";

export const recalculateProgress = inngest.createFunction(
  {
    id: "feature-progress-recalculate",
    name: "Recalculate Feature Progress",
    triggers: [{ event: "github/task.status.changed" }],
    debounce: {
      key: "event.data.featureId",
      period: "5s",
    },
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { featureId, taskId, newStatus, source } = event.data;

    const progress = await step.run("calculate-progress", async () => {
      const allTasks = await db
        .select({ id: tasksTable.id, status: tasksTable.status })
        .from(tasksTable)
        .where(eq(tasksTable.featureId, featureId));

      if (allTasks.length === 0) return 0;

      const done = allTasks.filter((t) => t.status === "DONE").length;
      return Math.round((done / allTasks.length) * 100);
    });

    await step.run("update-feature-progress", async () => {
      await db.update(featuresTable).set({ progress }).where(eq(featuresTable.id, featureId));
    });

    return { featureId, progress, triggeredBy: { taskId, newStatus, source } };
  },
);
