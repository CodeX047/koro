import { serve } from "inngest/next";
import { inngest } from "~/features/inngest/client";
import { processTask } from "~/features/inngest/functions";
import { reviewPullRequest } from "~/features/reviews/server/review-job";

// Create an API that serves zero functions for now
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processTask,
    reviewPullRequest,
  ],
});
