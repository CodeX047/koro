import { inngest } from "../client";
import { db, eq } from "@repo/database";
import { pullRequestsTable, repoSyncTable } from "@repo/database/schema";
import { formatPrFilesForReview, getPullRequestFiles } from "@repo/services/review/pr-files";
import { generateReview } from "@repo/services/review/generate-review";
import { postPrComment } from "@repo/services/review/post-pr-comment";
import { chunkPrFiles } from "@repo/services/review/chunk-code";
import { buildPrNamespace, saveChunksToPinecone, searchPrContext } from "@repo/services/review/vector";

export const reviewPR = inngest.createFunction(
  { 
    id: "review-pull-request", 
    triggers: [{ event: "review/pr.requested" }],
    retries: 3, 
    concurrency: { limit: 5 }
  },
  async ({ event, step }: { event: any; step: any }) => {
    const pullRequestId = event.data.pullRequestId;

    const [pullRequest] = await step.run("mark-processing", async () => {
        return db.update(pullRequestsTable).set({
            status: "processing"
        }).where(eq(pullRequestsTable.id, pullRequestId)).returning();
    });

    if (!pullRequest) {
        throw new Error(`PullRequest with ID ${pullRequestId} not found`);
    }

    const files = await step.run("fetch-pr-diff", async () => {
        return getPullRequestFiles(
            pullRequest.installationId,
            pullRequest.repoFullName,
            pullRequest.prNumber
        );
    });
    
    const diff = formatPrFilesForReview(files);

    const chunks = await step.run("breakdown-code", async () => {
        return chunkPrFiles(pullRequest.prNumber, files);
    });

    if (chunks.length === 0) {
        await step.run("mark-reviewed-no-code", async () => {
            await db.update(pullRequestsTable).set({ status: "reviewed" })
                .where(eq(pullRequestsTable.id, pullRequestId));
        });

        return { pullRequestId, status: "reviewed", reason: "no code to review" };
    }

    // PR namespace isolates this diff from other PRs and from repo-wide sync data
    const namespace = buildPrNamespace(
        pullRequest.repoFullName,
        pullRequest.prNumber
    );

    await step.run("save-vectors-to-pinecone", async () => {
        await saveChunksToPinecone(namespace, chunks);
    });

    // Pinecone needs a short delay before new vectors appear in search results
    await step.sleep("wait-for-vectors-to-index", "10s");

    // Extra context from the on-demand codebase sync, when the repo was synced
    const repoContextSnippets = await step.run("search-repo-context", async () => {
        const [repoSync] = await db.select().from(repoSyncTable).where(eq(repoSyncTable.repoFullName, pullRequest.repoFullName));

        if (!repoSync || repoSync.status !== "synced") {
            return [];
        }

        return searchPrContext(`${pullRequest.repoFullName.replace("/", "--")}--codebase`, pullRequest.title);
    });

    const review = await step.run("generate-ai-review", async () => {
        // Search within this PR's namespace for chunks related to the PR title
        const contextSnippets = await searchPrContext(
            namespace,
            pullRequest.title
        );

        return generateReview({
            repoFullName: pullRequest.repoFullName,
            title: pullRequest.title,
            diff,
            contextSnippets,
            repoContextSnippets,
        });
    });

    await step.run("post-pr-comment", async () => {
        await postPrComment(
            pullRequest.installationId,
            pullRequest.repoFullName,
            pullRequest.prNumber,
            review
        );
    });

    await step.run("mark-reviewed", async () => {
        await db.update(pullRequestsTable).set({
            status: "reviewed",
            reviewComment: review,
            reviewedAt: new Date(),
        }).where(eq(pullRequestsTable.id, pullRequestId));
    });

    await step.sendEvent("review-completed", {
      name: "notification/review.completed",
      data: {
        pullRequestId,
        message: "Review generated successfully.",
      },
    });

    return { pullRequestId, status: "reviewed" };
  }
);
