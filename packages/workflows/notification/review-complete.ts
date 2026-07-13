import { inngest } from "../client";

export const reviewCompleteNotification = inngest.createFunction(
  {
    id: "review-complete-notification",
    triggers: [{ event: "notification/review.completed" }],
    retries: 3,
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { pullRequestId, message } = event.data;

    await step.run("send-notification", async () => {
      console.log(`[Notification] Review completed for PR ${pullRequestId}: ${message}`);
      // Send Slack/Email/Web notification via notificationService
    });

    return { success: true };
  },
);
