import { serve } from "inngest/next";
import { inngest } from "@repo/workflows/client";
import { functions } from "@repo/workflows";

// Maximum execution time allowed by Vercel for this endpoint.
// Long-running work is checkpointed by Inngest.
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
