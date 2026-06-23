import { TaskAgent } from "@repo/ai";

export async function runGenerateTaskWorkflow(input: {
  prdId: string;
  prdContent: string;
}): Promise<void> {
  console.log("Starting runGenerateTaskWorkflow for PRD:", input.prdId);
  
  const taskAgent = new TaskAgent();
  const tasks = await taskAgent.plan(input.prdId, input.prdContent);
  
  console.log(`Generated ${tasks.length} tasks successfully.`);
  // In production, save generated tasks to DB (e.g. taskService.createMany)
}
