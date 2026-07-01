import { inngest } from "../client";
import { TaskAgent } from "@repo/ai";
import { getFeatureById, updateFeatureStatus, logFeatureEvent } from "@repo/services/feature";
import { getPrdByFeatureId } from "@repo/services/prd";
import { createTasksBatch } from "@repo/services/task";
import { v4 as uuidv4 } from "uuid";

export const generateTasks = inngest.createFunction(
  {
    id: "generate-tasks",
    triggers: [{ event: "task/generation.requested" }],
    retries: 2,
    concurrency: { limit: 5 },
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { featureId, prdId } = event.data;

    const feature = await step.run("fetch-feature", async () => {
      const f = await getFeatureById(featureId);
      if (!f) throw new Error("Feature not found");
      return f;
    });

    const prd = await step.run("fetch-prd", async () => {
      const p = await getPrdByFeatureId(featureId);
      if (!p) throw new Error("PRD not found");
      return p;
    });

    const generatedTasks = await step.run("run-task-agent", async () => {
      const agent = new TaskAgent();
      // The AI SDK generateObject throws if it fails Zod validation
      return await agent.plan({
        problemStatement: prd.problemStatement ?? undefined,
        goals: prd.goals ?? undefined,
        userStories: prd.userStories ?? undefined,
        acceptanceCriteria: prd.acceptanceCriteria ?? undefined,
        edgeCases: prd.edgeCases ?? undefined,
      });
    });

    await step.run("save-tasks", async () => {
      const tasksToInsert: any[] = [];
      const dependenciesToInsert: { taskId: string; dependsOnTaskId: string }[] = [];

      // 1. Extract and create epics
      const epics = new Set<string>();
      generatedTasks.forEach((t: any) => {
        if (t.epic) epics.add(t.epic);
      });

      const epicIdMap = new Map<string, string>();
      for (const epicTitle of epics) {
        const epicId = uuidv4();
        epicIdMap.set(epicTitle, epicId);
        tasksToInsert.push({
          id: epicId,
          projectId: feature.projectId,
          featureId,
          prdId,
          title: `Epic: ${epicTitle}`,
          description: `Container for ${epicTitle} tasks`,
          status: "TODO",
          priority: "MEDIUM",
          complexity: "HIGH",
          category: "other",
          order: 0,
        });
      }

      // 2. Create actual tasks
      const taskIdMap = new Map<string, string>();
      let orderCounter = 100;

      for (const t of generatedTasks) {
        const taskId = uuidv4();
        taskIdMap.set(t.title, taskId);

        tasksToInsert.push({
          id: taskId,
          projectId: feature.projectId,
          featureId: feature.id,
          prdId: feature.prdId,
          parentTaskId: t.epic ? epicIdMap.get(t.epic) : null,
          title: t.title,
          description: t.description,
          reason: t.reason,
          status: "TODO",
          priority: t.priority,
          complexity: t.complexity,
          category: t.category,
          estimatedHours: t.estimateHours,
          order: orderCounter++,
        });
      }

      // 3. Resolve dependencies
      for (const t of generatedTasks) {
        if (t.dependencies && t.dependencies.length > 0) {
          const taskId = taskIdMap.get(t.title)!;
          for (const depTitle of t.dependencies) {
            const depId = taskIdMap.get(depTitle);
            if (depId) {
              dependenciesToInsert.push({
                taskId,
                dependsOnTaskId: depId,
              });
            }
          }
        }
      }

      // 4. Batch insert
      await createTasksBatch(tasksToInsert, dependenciesToInsert);
    });

    await step.run("update-feature-status", async () => {
      await updateFeatureStatus(featureId, "TASKS_DRAFT");
      await logFeatureEvent(featureId, "tasks_generated", {
        taskCount: generatedTasks.length,
      });
    });

    await step.sendEvent("emit-task-generated", {
      name: "task/generated",
      data: { featureId },
    });

    return { success: true, featureId, tasksGenerated: generatedTasks.length };
  },
);
