import { inngest } from "../client";
import { PRDAgent } from "@repo/ai";

export const generatePRD = inngest.createFunction(
  { 
    id: "generate-prd", 
    triggers: [{ event: "prd/generate.requested" }],
    retries: 3, 
    concurrency: { limit: 5 } 
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { featureRequestId, title, description } = event.data;

    const prd = await step.run("generate-prd-content", async () => {
      const prdAgent = new PRDAgent();
      return await prdAgent.generate(title, description, []);
    });

    await step.run("save-prd", async () => {
      console.log(`[PRD] Successfully generated PRD for feature: ${featureRequestId}`);
      // In production: await prdService.save(prd);
    });

    return { success: true, featureRequestId };
  }
);
