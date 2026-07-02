import { inngest } from "../client";
import { PRDAgent } from "@repo/ai";
import { getFeatureById, updateFeatureStatus, logFeatureEvent } from "@repo/services/feature";
import { getClarificationsByFeatureId } from "@repo/services/clarification";
import { createPrd } from "@repo/services/prd";

const AI_MODEL = process.env.AI_MODEL || "openrouter/free";

export const generatePRD = inngest.createFunction(
  {
    id: "generate-prd",
    triggers: [{ event: "prd/generation.requested" }],
    retries: 3,
    concurrency: { limit: 5 },
    onFailure: async ({ event }) => {
      const featureId = event.data.event.data.featureId;
      if (featureId) {
        const { updateFeatureStatus } = await import("@repo/services/feature");
        await updateFeatureStatus(featureId, "FAILED");
      }
    },
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { featureId } = event.data;

    // Step 1 — Fetch feature and clarifications from DB
    const { feature, clarifications } = await step.run("fetch-feature-data", async () => {
      const feature = await getFeatureById(featureId);
      if (!feature) throw new Error(`Feature ${featureId} not found`);

      const clarifications = await getClarificationsByFeatureId(featureId);
      return { feature, clarifications };
    });

    // Step 2 — Call the PRD agent
    const { prd, generationTimeMs } = await step.run("run-prd-agent", async () => {
      const agent = new PRDAgent();
      const startMs = Date.now();

      // Map answered clarifications to the Q&A format the agent expects
      const answeredClarifications = clarifications
        .filter((c: any) => c.status === "ANSWERED" && c.answer)
        .map((c: any) => ({ question: c.question, answer: c.answer as string }));

      const prd = await agent.generate(
        feature.title,
        feature.description ?? "",
        answeredClarifications,
      );

      return { prd, generationTimeMs: Date.now() - startMs };
    });

    // Step 3 — Persist PRD to database
    const savedPrd = await step.run("save-prd", async () => {
      return createPrd({
        featureId,
        title: feature.title,
        prd,
        model: AI_MODEL,
        generationTimeMs,
      });
    });

    // Step 4 — Update feature status and log event
    await step.run("finalize-feature-status", async () => {
      await updateFeatureStatus(featureId, "PRD_READY");
      await logFeatureEvent(featureId, "prd_generated", {
        prdId: savedPrd.id,
        model: AI_MODEL,
        generationTimeMs,
      });
    });

    // Step 5 — Fire completion event for downstream listeners
    await step.sendEvent("emit-prd-generated", {
      name: "prd/generated",
      data: { featureId, prdId: savedPrd.id },
    });

    return { success: true, featureId, prdId: savedPrd.id };
  },
);
