import { ReviewAgent } from "@repo/ai";

export async function runReviewPRWorkflow(input: {
  pullRequestId: string;
  diff: string;
  prdContent: string;
}): Promise<void> {
  console.log("Starting runReviewPRWorkflow for PR:", input.pullRequestId);
  
  const reviewAgent = new ReviewAgent();
  const review = await reviewAgent.review(input.diff, input.prdContent);
  
  console.log(`Review finished with verdict: ${review.verdict}, score: ${review.score}`);
  // In production, save review results to DB and post comment on GitHub
}
