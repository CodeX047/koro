import { inngest } from "../client";
import { db, eq, and, sql } from "@repo/database";
import {
  pullRequestsTable,
  developmentEventsTable,
  repositoriesTable,
} from "@repo/database/schema";
import type { PrReviewWebhookData } from "./types";

export const processPrReview = inngest.createFunction(
  {
    id: "github-process-pr-review",
    name: "Process GitHub PR Review",
    triggers: [{ event: "github/pr-review.event" }],
    concurrency: {
      limit: 5,
      key: "event.data.repositoryFullName",
    },
  },
  async ({ event, step }: { event: { data: PrReviewWebhookData }; step: any }) => {
    const data = event.data;

    if (data.action !== "submitted") {
      return { skipped: true, reason: `action_${data.action}` };
    }

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

    const pr = await step.run("find-pr", async () => {
      const [match] = await db
        .select()
        .from(pullRequestsTable)
        .where(
          and(
            eq(pullRequestsTable.repoFullName, data.repositoryFullName),
            eq(pullRequestsTable.prNumber, data.prNumber),
          ),
        )
        .limit(1);
      return match || null;
    });

    if (!pr) {
      return { skipped: true, reason: "pr_not_found" };
    }

    let reviewDecision: string | null = null;
    if (data.state === "approved") reviewDecision = "APPROVED";
    else if (data.state === "changes_requested") reviewDecision = "CHANGES_REQUESTED";

    await step.run("update-pr-review", async () => {
      const updates: Record<string, any> = {
        reviewCount: sql`COALESCE(${pullRequestsTable.reviewCount}, 0) + 1`,
      };
      if (reviewDecision) {
        updates.reviewDecision = reviewDecision;
      }
      await db.update(pullRequestsTable).set(updates).where(eq(pullRequestsTable.id, pr.id));
    });

    if (pr.featureId) {
      await step.run("log-review-event", async () => {
        let eventType = "PR Review Submitted";
        if (data.state === "approved") eventType = "PR Review Approved";
        else if (data.state === "changes_requested") eventType = "PR Review Changes Requested";

        await db.insert(developmentEventsTable).values({
          featureId: pr.featureId!,
          eventType,
          actor: data.reviewer,
          resourceType: "review",
          resourceId: String(data.prNumber),
          metadata: {
            prNumber: data.prNumber,
            state: data.state,
            reviewer: data.reviewer,
            body: data.body?.slice(0, 500), // Truncate long reviews
          },
        });
      });

      await step.sendEvent("development-event-created", {
        name: "development/event.created",
        data: { featureId: pr.featureId, source: "github_pr_review" },
      });
    }

    return { processed: true, prNumber: data.prNumber, reviewState: data.state };
  },
);
