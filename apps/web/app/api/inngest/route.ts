import { serve } from "inngest/next";
import { inngest } from "~/features/inngest/client";
import { processTask } from "~/features/inngest/functions";

// Create an API that serves zero functions for now
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processTask,
  ],
});
