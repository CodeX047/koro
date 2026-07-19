import { inngest } from "../client";
import { db, eq, and } from "@repo/database";
import { repositoriesTable, developmentEventsTable } from "@repo/database/schema";
import { githubPullRequestService } from "@repo/services/github/pull-request";

export const processPullRequest = inngest.createFunction(
  {
    id: "github-process-pr",
    name: "Process GitHub PR",
    triggers: [{ event: "github/pr.event" }],
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { installationId, repositoryFullName, payload } = event.data;

    // 1. Find the connected repository
    const repo = await step.run("get-repository", async () => {
      const [r] = await db
        .select()
        .from(repositoriesTable)
        .where(
          and(
            eq(repositoriesTable.installationId, installationId),
            eq(repositoriesTable.owner, repositoryFullName.split("/")[0]),
            eq(repositoriesTable.name, repositoryFullName.split("/")[1]),
          ),
        )
        .limit(1);
      return r || null;
    });

    if (!repo) {
      console.log(`Repository ${repositoryFullName} not connected. Skipping PR processing.`);
      return;
    }

    // 2. Process PR and fetch files/commits
    const result = await step.run("process-pr", async () => {
      return await githubPullRequestService.processPullRequestEvent(
        installationId,
        repo.id,
        payload,
      );
    });

    const pr = result?.pr;
    const statusChanges = result?.statusChanges ?? [];

    // 3. Log development event if featureId exists
    if (pr?.featureId) {
      await step.run("log-development-event", async () => {
        let eventType = "PR Updated";
        if (payload.action === "opened") eventType = "PR Opened";
        else if (payload.action === "closed" && payload.pull_request.merged)
          eventType = "PR Merged";
        else if (payload.action === "closed") eventType = "PR Closed";
        else if (payload.action === "reopened") eventType = "PR Reopened";

        await db.insert(developmentEventsTable).values({
          featureId: pr.featureId,
          eventType,
          actor: payload.pull_request?.user?.login ?? payload.sender?.login ?? null,
          resourceType: "pull_request",
          resourceId: String(pr.prNumber),
          metadata: {
            prId: pr.id,
            prNumber: pr.prNumber,
            title: pr.title,
          },
        });
      });

      await step.sendEvent("development-event-created", {
        name: "development/event.created",
        data: { featureId: pr.featureId, source: "github_pr" },
      });
    }

    // 4. Emit domain events for task status changes (progress recalculation)
    if (statusChanges.length > 0) {
      await step.run("emit-status-changes", async () => {
        for (const change of statusChanges) {
          await inngest.send({
            name: "github/task.status.changed",
            data: change,
          });
        }
      });
    }

    // 5. Dispatch AI Review Workflow
    if (pr && payload.action === "opened") {
      await step.sendEvent("trigger-review", {
        name: "review/pr.requested",
        data: { pullRequestId: pr.id },
      });
    } else if (pr && payload.action === "synchronize") {
      await step.sendEvent("trigger-rereview", {
        name: "review/rereview.requested",
        data: { pullRequestId: pr.id },
      });
    }

    return { processed: true, prId: pr?.id };
  },
);
