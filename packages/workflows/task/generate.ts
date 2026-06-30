import { inngest } from "../client";
import { TaskAgent } from "@repo/ai";

export const generateTasks = inngest.createFunction(
  { 
    id: "generate-task", 
    triggers: [{ event: "task/generate.requested" }],
    retries: 3, 
    concurrency: { limit: 5 } 
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { prdId, prdContent } = event.data;

    const tasks = await step.run("generate-tasks", async () => {
      const taskAgent = new TaskAgent();
      return await taskAgent.plan(prdId, prdContent);
    });

    await step.run("save-tasks", async () => {
      console.log(`[Task] Generated ${tasks.length} tasks successfully.`);
      // In production: await taskService.createMany(tasks);
    });

    return { success: true, tasksGenerated: tasks.length };
  }
);
