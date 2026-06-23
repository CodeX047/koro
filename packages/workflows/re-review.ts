import { ReviewAgent } from "@repo/ai";

export async function runReReviewWorkflow(input: {
  pullRequestId: string;
  previousReviewId: string;
  newDiff: string;
  prdContent: string;
}): Promise<void> {
  console.log("Starting runReReviewWorkflow for PR:", input.pullRequestId);
  
  const reviewAgent = new ReviewAgent();
  const newReview = await reviewAgent.review(input.newDiff, input.prdContent);
  
  console.log(`Re-review finished. Verdict: ${newReview.verdict}`);
  // In production, compare with previous review issues, update state, and post to GitHub
}
