export const reviewService = {
  async runReview(pullRequestId: string) {
    console.log(`[ReviewService] Running review for PR: ${pullRequestId}`);
    // This is a stub for the migrated business logic
    return { status: "reviewed" };
  }
};
