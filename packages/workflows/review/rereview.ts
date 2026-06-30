import { inngest } from "../client";

export const rereviewPR = inngest.createFunction(
  { 
    id: "rereview-pull-request", 
    triggers: [{ event: "review/rereview.requested" }],
    retries: 3, 
    concurrency: { limit: 5 } 
  },
  async ({ event, step }: { event: any; step: any }) => {
    // Scaffold
    return { status: "rereviewed" };
  }
);
