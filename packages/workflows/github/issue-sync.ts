import { inngest } from "../client";
import { db, eq, and } from "@repo/database";
import {
  githubIssuesTable,
  tasksTable,
  developmentEventsTable,
  repositoriesTable,
} from "@repo/database/schema";
import type { IssueWebhookData } from "./types";

export const processIssueEvent = inngest.createFunction(
  {
    id: "github-process-issue",
    name: "Process GitHub Issue Event",
    triggers: [{ event: "github/issue.event" }],
    concurrency: {
      limit: 5,
      key: "event.data.repositoryFullName",
    },
  },
  async ({ event, step }: { event: { data: IssueWebhookData }; step: any }) => {
    const data = event.data;

    const repo = await step.run("verify-repository", async () => {
      const [owner, name] = data.repositoryFullName.split("/") as [string, string];
      const [r] = await db
        .select()
        .from(repositoriesTable)
        .where(
          and(
            eq(repositoriesTable.installationId, data.installationId),
            eq(repositoriesTable.owner, owner),
            eq(repositoriesTable.name, name),
          ),
        )
        .limit(1);
      return r || null;
    });

    if (!repo) {
      console.log(`Repository ${data.repositoryFullName} not connected. Skipping issue event.`);
      return { skipped: true, reason: "repository_not_connected" };
    }

    const linkedIssue = await step.run("find-linked-issue", async () => {
      const [issue] = await db
        .select()
        .from(githubIssuesTable)
        .where(eq(githubIssuesTable.issueNumber, data.issueNumber))
        .limit(1);
      return issue || null;
    });

    if (!linkedIssue) {
      console.log(
        `Issue #${data.issueNumber} on ${data.repositoryFullName} is not linked to a Kōro task. Skipping.`,
      );
      return { skipped: true, reason: "external_issue" };
    }

    const task = await step.run("get-task", async () => {
      const [t] = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.id, linkedIssue.taskId))
        .limit(1);
      return t || null;
    });

    if (!task) {
      return { skipped: true, reason: "task_not_found" };
    }

    const githubEventId = `issue-${data.action}-${data.issueNumber}-${Date.now()}`;
    const alreadyProcessed = await step.run("check-idempotency", async () => {
      if (data.action === "closed" || data.action === "reopened") {
        const recentEvents = await db
          .select()
          .from(developmentEventsTable)
          .where(
            and(
              eq(developmentEventsTable.featureId, task.featureId!),
              eq(
                developmentEventsTable.eventType,
                data.action === "closed" ? "Issue Closed" : "Issue Reopened",
              ),
              eq(developmentEventsTable.resourceId, String(data.issueNumber)),
            ),
          )
          .limit(1);

        if (recentEvents.length > 0 && recentEvents[0]) {
          const lastEvent = recentEvents[0];
          const timeDiff = Date.now() - lastEvent.createdAt.getTime();
          if (timeDiff < 60_000) return true;
        }
      }
      return false;
    });

    if (alreadyProcessed) {
      return { skipped: true, reason: "duplicate_event" };
    }

    switch (data.action) {
      case "closed": {
        await step.run("process-issue-closed", async () => {
          const previousStatus = task.status;

          await db
            .update(tasksTable)
            .set({
              githubState: "CLOSED",
              githubUpdatedAt: new Date(),
              status: "DONE",
              completedAt: new Date(),
            })
            .where(eq(tasksTable.id, task.id));

          await db
            .update(githubIssuesTable)
            .set({
              state: "closed",
              closedAt: new Date(),
            })
            .where(eq(githubIssuesTable.id, linkedIssue.id));

          if (task.featureId) {
            await db.insert(developmentEventsTable).values({
              featureId: task.featureId,
              eventType: "Issue Closed",
              githubEventId,
              actor: data.sender,
              resourceType: "issue",
              resourceId: String(data.issueNumber),
              metadata: { title: data.title, taskId: task.id },
            });
          }

          if (task.featureId) {
            await inngest.send({
              name: "github/task.status.changed",
              data: {
                taskId: task.id,
                featureId: task.featureId,
                newStatus: "DONE",
                previousStatus,
                source: "issue_closed" as const,
              },
            });
          }
        });
        break;
      }

      case "reopened": {
        await step.run("process-issue-reopened", async () => {
          const previousStatus = task.status;

          await db
            .update(tasksTable)
            .set({
              githubState: "OPEN",
              githubUpdatedAt: new Date(),
              status: "TODO",
              completedAt: null,
            })
            .where(eq(tasksTable.id, task.id));

          await db
            .update(githubIssuesTable)
            .set({
              state: "open",
              closedAt: null,
            })
            .where(eq(githubIssuesTable.id, linkedIssue.id));

          if (task.featureId) {
            await db.insert(developmentEventsTable).values({
              featureId: task.featureId,
              eventType: "Issue Reopened",
              githubEventId,
              actor: data.sender,
              resourceType: "issue",
              resourceId: String(data.issueNumber),
              metadata: { title: data.title, taskId: task.id },
            });

            await inngest.send({
              name: "github/task.status.changed",
              data: {
                taskId: task.id,
                featureId: task.featureId,
                newStatus: "TODO",
                previousStatus,
                source: "issue_reopened" as const,
              },
            });
          }
        });
        break;
      }

      case "assigned": {
        await step.run("process-issue-assigned", async () => {
          await db
            .update(githubIssuesTable)
            .set({ assignee: data.assignee })
            .where(eq(githubIssuesTable.id, linkedIssue.id));

          if (data.assignee) {
            await db
              .update(tasksTable)
              .set({ assigneeId: data.assignee, githubUpdatedAt: new Date() })
              .where(eq(tasksTable.id, task.id));
          }

          if (task.featureId) {
            await db.insert(developmentEventsTable).values({
              featureId: task.featureId,
              eventType: "Issue Assigned",
              githubEventId,
              actor: data.sender,
              resourceType: "issue",
              resourceId: String(data.issueNumber),
              metadata: { assignee: data.assignee, title: data.title },
            });
          }
        });
        break;
      }

      case "unassigned": {
        await step.run("process-issue-unassigned", async () => {
          await db
            .update(githubIssuesTable)
            .set({ assignee: null })
            .where(eq(githubIssuesTable.id, linkedIssue.id));

          if (task.featureId) {
            await db.insert(developmentEventsTable).values({
              featureId: task.featureId,
              eventType: "Issue Unassigned",
              githubEventId,
              actor: data.sender,
              resourceType: "issue",
              resourceId: String(data.issueNumber),
              metadata: { title: data.title },
            });
          }
        });
        break;
      }

      case "labeled":
      case "unlabeled": {
        await step.run("process-issue-labels", async () => {
          await db
            .update(githubIssuesTable)
            .set({ labels: data.labels })
            .where(eq(githubIssuesTable.id, linkedIssue.id));

          if (task.featureId) {
            await db.insert(developmentEventsTable).values({
              featureId: task.featureId,
              eventType: data.action === "labeled" ? "Issue Labeled" : "Issue Unlabeled",
              githubEventId,
              actor: data.sender,
              resourceType: "issue",
              resourceId: String(data.issueNumber),
              metadata: { labels: data.labels, title: data.title },
            });
          }
        });
        break;
      }

      default:
        // Other issue actions — just log
        break;
    }

    return { processed: true, action: data.action, issueNumber: data.issueNumber };
  },
);
