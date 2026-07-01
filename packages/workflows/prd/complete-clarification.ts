import { inngest } from "../client";
import { getFeatureById, updateFeatureStatus, logFeatureEvent } from "@repo/services/feature";
import { getClarificationsByFeatureId } from "@repo/services/clarification";

/**
 * Triggered when the user submits answers to their clarification questions.
 * Transitions feature status and fires the PRD generation event.
 */
export const completeClarification = inngest.createFunction(
  {
    id: "complete-clarification",
    triggers: [{ event: "clarification/completed" }],
    retries: 2,
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { featureId } = event.data;

    await step.run("transition-status", async () => {
      await updateFeatureStatus(featureId, "CLARIFICATION_COMPLETE");
      await logFeatureEvent(featureId, "clarification_completed", {
        skipped: false,
      });
    });

    // Small delay to let DB writes settle before generation starts
    await step.sleep("brief-settle", "1s");

    await step.run("start-prd-generation", async () => {
      await updateFeatureStatus(featureId, "PRD_GENERATING");
      await logFeatureEvent(featureId, "prd_generation_started", {});
    });

    await step.sendEvent("send-prd-generation-event", {
      name: "prd/generation.requested",
      data: { featureId },
    });

    return { featureId, nextStep: "prd_generation" };
  },
);
