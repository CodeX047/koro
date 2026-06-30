import { inngest } from "../client";
import { reviewService } from "@repo/services/review";

export const reviewPR = inngest.createFunction(
  { 
    id: "review-pull-request", 
    triggers: [{ event: "review/pr.requested" }],
    retries: 3, 
    concurrency: { limit: 5 }
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { pullRequestId } = event.data;

    const result = await step.run("execute-review", async () => {
      // Delegate to service layer
      return await reviewService.runReview(pullRequestId);
    });

    await step.sendEvent("review-completed", {
      name: "review/pr.completed",
      data: {
        pullRequestId,
        status: result.status,
      },
    });

    return result;
  }
);
