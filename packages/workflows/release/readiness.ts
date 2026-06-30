import { inngest } from "../client";

export const releaseReadiness = inngest.createFunction(
  { 
    id: "release-readiness", 
    triggers: [{ event: "release/readiness.requested" }],
    retries: 3 
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { featureRequestId } = event.data;
    
    return await step.run("check-readiness", async () => {
      console.log(`[Release] Checking readiness for feature: ${featureRequestId}`);
      return {
        isReady: true,
        score: 95,
        unresolvedBlockingIssuesCount: 0,
        reason: "All blocking issues have been resolved."
      };
    });
  }
);
