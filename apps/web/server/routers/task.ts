import { z } from "zod";
import { organizationProcedure, featureProcedure, taskProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { checkAuthorization } from "@repo/services/security/authorize";
import { inngest } from "@repo/workflows/client";
import {
  getTasksByFeatureId,
  updateTaskStatus,
  moveTask,
  updateTask,
  getTaskById,
  snapshotPlan,
  createTask,
} from "@repo/services/task";
import { updateFeatureStatus } from "@repo/services/feature";
import { db, eq } from "@repo/database";
import { featuresTable, githubIssuesTable, tasksTable } from "@repo/database/schema";
import { githubService } from "@repo/services/github";

export const taskRouter = router({
  listByFeature: featureProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getTasksByFeatureId(input.featureId);
    }),

  generate: featureProcedure
    .input(z.object({ featureId: z.string().uuid(), prdId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await updateFeatureStatus(input.featureId, "TASKS_GENERATING");

      await inngest.send({
        name: "task/generation.requested",
        data: { featureId: input.featureId, prdId: input.prdId },
      });

      return { success: true, featureId: input.featureId };
    }),

  create: organizationProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        featureId: z.string().uuid().optional(),
        prdId: z.string().uuid().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"]).default("TODO"),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
        complexity: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
        category: z
          .enum(["frontend", "backend", "database", "testing", "devops", "documentation", "other"])
          .default("other"),
        estimatedHours: z.number().nullable().optional(),
        assigneeId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const isAuthorized = await checkAuthorization({
        resource: "project",
        id: input.projectId,
        organizationId: ctx.activeOrganizationId!,
      });
      if (!isAuthorized) throw new TRPCError({ code: "NOT_FOUND" });

      return createTask(input);
    }),

  updateStatus: taskProcedure
    .input(
      z.object({
        taskId: z.string().uuid(),
        status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"]),
      }),
    )
    .mutation(async ({ input }) => {
      const [oldTask] = await db.select().from(tasksTable).where(eq(tasksTable.id, input.taskId));
      const updated = await updateTaskStatus(input.taskId, input.status);

      if (oldTask && oldTask.status !== input.status && oldTask.featureId) {
        await inngest.send({
          name: "github/task.status.changed",
          data: {
            taskId: input.taskId,
            featureId: oldTask.featureId,
            newStatus: input.status,
            previousStatus: oldTask.status,
            source: "manual",
          },
        });
      }
      return updated;
    }),

  move: taskProcedure
    .input(
      z.object({
        taskId: z.string().uuid(),
        status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"]),
        order: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const [oldTask] = await db.select().from(tasksTable).where(eq(tasksTable.id, input.taskId));
      const updated = await moveTask(input.taskId, input.status, input.order);

      if (oldTask && oldTask.status !== input.status && oldTask.featureId) {
        await inngest.send({
          name: "github/task.status.changed",
          data: {
            taskId: input.taskId,
            featureId: oldTask.featureId,
            newStatus: input.status,
            previousStatus: oldTask.status,
            source: "manual",
          },
        });
      }
      return updated;
    }),

  update: taskProcedure
    .input(
      z.object({
        taskId: z.string().uuid(),
        data: z.object({
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
          complexity: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
          estimatedHours: z.number().nullable().optional(),
          assigneeId: z.string().nullable().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      return updateTask(input.taskId, input.data);
    }),

  approvePlan: featureProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await snapshotPlan(input.featureId);

      await updateFeatureStatus(input.featureId, "PLANNING_COMPLETE");

      await inngest.send({
        name: "planning/approved",
        data: { featureId: input.featureId },
      });

      return { success: true, featureId: input.featureId };
    }),

  syncToGithub: featureProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await inngest.send({
        name: "github/issues.sync.requested",
        data: { featureId: input.featureId },
      });
      return { success: true };
    }),

  fetchGithubUpdates: featureProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const feature = await db
        .select()
        .from(featuresTable)
        .where(eq(featuresTable.id, input.featureId))
        .limit(1);

      if (!feature[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const repo = await githubService.getConnectedRepository(feature[0].projectId);
      if (!repo) return { success: false, message: "No connected repository" };

      const tasks = await getTasksByFeatureId(input.featureId);
      const app = githubService.getGithubApp();
      const octokit = await app.getInstallationOctokit(repo.installationId);

      let updatedCount = 0;

      for (const task of tasks) {
        if (task.githubIssueNumber) {
          try {
            const { data: issue } = await octokit.request(
              "GET /repos/{owner}/{repo}/issues/{issue_number}",
              {
                owner: repo.owner,
                repo: repo.name,
                issue_number: task.githubIssueNumber,
              },
            );

            let newStatus = task.status;
            if (issue.state === "closed") {
              newStatus = "DONE";
            } else if (issue.state === "open" && task.status === "DONE") {
              newStatus = "IN_PROGRESS";
            }

            if (newStatus !== task.status) {
              await updateTaskStatus(task.id, newStatus);
              updatedCount++;
            }

            await db
              .update(githubIssuesTable)
              .set({ state: issue.state, updatedAt: new Date() })
              .where(eq(githubIssuesTable.taskId, task.id));
          } catch (err) {
            console.error(`Failed to fetch issue ${task.githubIssueNumber}:`, err);
          }
        }
      }

      return { success: true, updatedCount };
    }),
});
