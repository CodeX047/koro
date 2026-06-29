import { inngest } from "~/features/inngest/client";
import { db, eq } from "@repo/database";
import { pullRequestsTable } from "@repo/database/schema";
import { formatPrFilesForReview, getPullRequestFiles } from "./pr-files";
import { generateReview } from "./generate-review";
import { postPrComment } from "./post-pr-comment";


export const reviewPullRequest = inngest.createFunction(
    { id: "review-pull-request", triggers: [{ event: "github/pr.received" }] },
    async ({ event, step }: { event: any, step: any }) => {
        const pullRequestId = event.data.pullRequestId;

        const [pullRequest] = await step.run("mark-processing", async () => {
            return db.update(pullRequestsTable).set({
                status: "processing"
            }).where(eq(pullRequestsTable.id, pullRequestId)).returning();
        })

        if (!pullRequest) {
            throw new Error(`PullRequest with ID ${pullRequestId} not found`);
        }

        const diff = await step.run("fetch-pr-diff", async () => {
            const files = await getPullRequestFiles(
                pullRequest.installationId,
                pullRequest.repoFullName,
                pullRequest.prNumber
            );

            return formatPrFilesForReview(files);
        });

        if (!diff.trim()) {
            await step.run("mark-reviewed-no-code", async () => {
                await db.update(pullRequestsTable).set({ status: "reviewed" })
                    .where(eq(pullRequestsTable.id, pullRequestId));
            });

            return { pullRequestId, status: "reviewed", reason: "no code to review" };
        }

        const review = await step.run("generate-ai-review", async () => {
            return generateReview({
                repoFullName: pullRequest.repoFullName,
                title: pullRequest.title,
                diff,
            });
        });


        await step.run("post-pr-comment", async () => {
            await postPrComment(
                pullRequest.installationId,
                pullRequest.repoFullName,
                pullRequest.prNumber,
                review
            );
        })


        await step.run("mark-reviewed", async () => {
            await db.update(pullRequestsTable).set({
                status: "reviewed",
                reviewComment: review,
                reviewedAt: new Date(),
            }).where(eq(pullRequestsTable.id, pullRequestId));
        });

        return { pullRequestId, status: "reviewed" };
    }
);
