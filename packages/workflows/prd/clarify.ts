import { inngest } from "../client";
import { ClarificationAgent } from "@repo/ai";
import { getFeatureById, updateFeatureStatus, logFeatureEvent } from "@repo/services/feature";
import { saveClarificationQuestions } from "@repo/services/clarification";

/**
 * Triggered immediately after a feature is created.
 *
 * Decision tree:
 *   - If the AI decides clarification IS needed → save questions, fire "clarification/requested"
 *   - If the AI decides NO clarification needed → jump straight to "prd/generation.requested"
 */
export const clarifyFeature = inngest.createFunction(
  {
    id: "clarify-feature",
    triggers: [{ event: "feature/requested" }],
    retries: 2,
    concurrency: { limit: 10 },
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { featureId, title, description } = event.data;

    // Step 1 — Run clarification agent
    const clarificationResult = await step.run("run-clarification-agent", async () => {
      const agent = new ClarificationAgent();
      return agent.clarify(title, description);
    });

    // Step 2 — Branch: skip or ask
    if (!clarificationResult.needsClarification) {
      await step.run("skip-to-prd-generation", async () => {
        await updateFeatureStatus(featureId, "PRD_GENERATING");
        await logFeatureEvent(featureId, "clarification_completed", {
          skipped: true,
          reason: "ai_determined_sufficient_context",
        });
      });

      await step.sendEvent("send-prd-generation-event", {
        name: "prd/generation.requested",
        data: { featureId },
      });

      return { featureId, clarificationNeeded: false };
    }

    // Step 3 — Save questions to DB
    await step.run("save-clarification-questions", async () => {
      await saveClarificationQuestions(featureId, clarificationResult.questions);
      await updateFeatureStatus(featureId, "CLARIFICATION_PENDING");
      await logFeatureEvent(featureId, "clarification_requested", {
        questionCount: clarificationResult.questions.length,
      });
    });

    // Step 4 — Notify that clarification is waiting
    await step.sendEvent("send-clarification-requested-event", {
      name: "clarification/requested",
      data: {
        featureId,
        questionCount: clarificationResult.questions.length,
      },
    });

    return {
      featureId,
      clarificationNeeded: true,
      questionCount: clarificationResult.questions.length,
    };
  },
);
