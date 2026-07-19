import { inngest } from "../client";
import { db, eq } from "@repo/database";
import { pullRequestsTable } from "@repo/database/schema";
import { recalculateFeatureMetrics } from "@repo/services/analytics";

async function featureIdFromEvent(event: any) {
  if (event.data?.featureId) return event.data.featureId as string;

  const pullRequestId = event.data?.pullRequestId;
  if (pullRequestId) {
    const [pr] = await db
      .select()
      .from(pullRequestsTable)
      .where(eq(pullRequestsTable.id, pullRequestId))
      .limit(1);
    return pr?.featureId ?? null;
  }

  return null;
}

export const recalculateAnalytics = inngest.createFunction(
  {
    id: "analytics-recalculate",
    name: "Recalculate Delivery Analytics",
    triggers: [
      { event: "development/event.created" },
      { event: "notification/review.completed" },
      { event: "review/pr.completed" },
      { event: "release/readiness.completed" },
      { event: "github/task.status.changed" },
    ],
  },
  async ({ event, step }: { event: any; step: any }) => {
    const featureId = await step.run("resolve-feature", async () => featureIdFromEvent(event));
    if (!featureId) return { skipped: true, reason: "feature_not_found" };

    const metrics = await step.run("recalculate-metrics", async () =>
      recalculateFeatureMetrics(featureId),
    );

    await step.sendEvent("analytics-updated", {
      name: "analytics/updated",
      data: {
        featureId,
        recalculatedAt: new Date().toISOString(),
      },
    });

    return { featureId, metrics };
  },
);
