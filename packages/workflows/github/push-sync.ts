import { inngest } from "../client";
import { db, eq, and } from "@repo/database";
import {
  pullRequestsTable,
  commitsTable,
  developmentEventsTable,
  repositoriesTable,
} from "@repo/database/schema";
import type { PushWebhookData } from "./types";

export const processPushEvent = inngest.createFunction(
  {
    id: "github-process-push",
    name: "Process GitHub Push Event",
    triggers: [{ event: "github/push.event" }],
    concurrency: {
      limit: 5,
      key: "event.data.repositoryFullName",
    },
  },
  async ({ event, step }: { event: { data: PushWebhookData }; step: any }) => {
    const data = event.data;

    const branchName = data.ref.replace("refs/heads/", "");

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
      return { skipped: true, reason: "repository_not_connected" };
    }

    const pr = await step.run("find-matching-pr", async () => {
      const [match] = await db
        .select()
        .from(pullRequestsTable)
        .where(
          and(
            eq(pullRequestsTable.repoFullName, data.repositoryFullName),
            eq(pullRequestsTable.headBranch, branchName),
            eq(pullRequestsTable.status, "OPENED"),
          ),
        )
        .limit(1);
      return match || null;
    });

    if (pr && data.commits.length > 0) {
      await step.run("store-commits", async () => {
        const commitsToInsert = data.commits.map((c) => ({
          prId: pr.id,
          sha: c.sha,
          message: c.message,
          author: c.author,
          timestamp: new Date(c.timestamp),
        }));
        await db.insert(commitsTable).values(commitsToInsert);
      });

      await step.run("update-pr-commit-sha", async () => {
        await db
          .update(pullRequestsTable)
          .set({
            lastCommitSha: data.headCommitSha || data.after,
            headSha: data.headCommitSha || data.after,
          })
          .where(eq(pullRequestsTable.id, pr.id));
      });

      if (pr.featureId) {
        await step.run("log-push-event", async () => {
          await db.insert(developmentEventsTable).values({
            featureId: pr.featureId!,
            eventType: "Commits Pushed",
            actor: data.sender,
            resourceType: "commit",
            resourceId: data.headCommitSha || data.after,
            metadata: {
              branch: branchName,
              commitCount: data.commits.length,
              prNumber: pr.prNumber,
              commits: data.commits.slice(0, 5).map((c) => ({
                sha: c.sha.slice(0, 7),
                message: c.message.split("\n")[0],
              })),
            },
          });
        });
      }

      if (pr.reviewStatus === "COMPLETED") {
        await step.sendEvent("trigger-rereview", {
          name: "review/rereview.requested",
          data: { pullRequestId: pr.id },
        });
      }
    }

    return {
      processed: true,
      branch: branchName,
      commitCount: data.commits.length,
      prMatched: !!pr,
    };
  },
);
