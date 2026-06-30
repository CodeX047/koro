import { inngest } from "../client";
import { handleWebhookEvent } from "@repo/services/billing/subscription";

export const dodoWebhookReceived = inngest.createFunction(
  { 
    id: "dodo-webhook-received",
    triggers: [{ event: "billing.dodo.webhook.received" }]
  },
  async ({ event, step }: { event: any; step: any }) => {
    await step.run("process-dodo-webhook", async () => {
      await handleWebhookEvent(event.data);
    });
  }
);
