import { inngest } from "../client";
import { db, eq, and } from "@repo/database";
import { pullRequestsTable, repositoriesTable, reviewRunsTable, prdsTable, tasksTable, repoSyncTable } from "@repo/database/schema";
import { formatPrFilesForReview, getPullRequestFiles } from "@repo/services/review/pr-files";
import { ReviewAgent } from "@repo/ai/agents/review";
import { submitPrReview } from "@repo/services/review/submit-pr-review";
import { chunkPrFiles } from "@repo/services/review/chunk-code";
import { buildPrNamespace, saveChunksToPinecone, searchPrContext } from "@repo/services/review/vector";
import { canRunAIReview } from "@repo/services/billing/access";

export const reviewPR = inngest.createFunction(
  { 
    id: "review-pull-request", 
    triggers: [{ event: "review/pr.requested" }, { event: "review/rereview.requested" }],
    retries: 3, 
    concurrency: { limit: 5 }
  },
  async ({ event, step }: { event: any; step: any }) => {
    const pullRequestId = event.data.pullRequestId;

    const pullRequest = await step.run("fetch-pr", async () => {
        const [pr] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.id, pullRequestId));
        return pr;
    });

    if (!pullRequest) {
        throw new Error(`PullRequest with ID ${pullRequestId} not found`);
    }

    const repository = await step.run("fetch-repository", async () => {
        const [repo] = await db.select().from(repositoriesTable).where(eq(repositoriesTable.id, pullRequest.repositoryId));
        return repo;
    });

    if (!repository) {
        throw new Error(`Repository with ID ${pullRequest.repositoryId} not found`);
    }

    // Tenant / Billing check
    const canRun = await step.run("check-billing", async () => {
        return canRunAIReview(repository.organizationId);
    });

    if (!canRun) {
        console.warn(`Org ${repository.organizationId} has exhausted AI review limits.`);
        return { pullRequestId, status: "skipped", reason: "billing_limit_reached" };
    }

    // Deduplication / Check if headSha already reviewed
    const alreadyReviewed = await step.run("check-already-reviewed", async () => {
        const [run] = await db.select()
          .from(reviewRunsTable)
          .where(and(eq(reviewRunsTable.prId, pullRequestId), eq(reviewRunsTable.headSha, pullRequest.headSha)))
          .limit(1);
        return !!run;
    });

    if (alreadyReviewed) {
        console.log(`PR ${pullRequestId} at sha ${pullRequest.headSha} already reviewed. Skipping.`);
        return { pullRequestId, status: "skipped", reason: "already_reviewed" };
    }

    await step.run("mark-processing", async () => {
        await db.update(pullRequestsTable).set({ reviewStatus: "RUNNING" })
          .where(eq(pullRequestsTable.id, pullRequestId));
    });

    // Fetch PR diff
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
            await db.update(pullRequestsTable).set({ reviewStatus: "COMPLETED" })
                .where(eq(pullRequestsTable.id, pullRequestId));
        });
        return { pullRequestId, status: "reviewed", reason: "no code to review" };
    }

    const namespace = buildPrNamespace(pullRequest.repoFullName, pullRequest.prNumber);

    await step.run("save-vectors-to-pinecone", async () => {
        await saveChunksToPinecone(namespace, chunks);
    });
    await step.sleep("wait-for-vectors-to-index", "10s");

    // Fetch additional context
    const repoContextSnippets = await step.run("search-repo-context", async () => {
        const [repoSync] = await db.select().from(repoSyncTable).where(eq(repoSyncTable.repoFullName, pullRequest.repoFullName));
        if (!repoSync || repoSync.status !== "synced") return [];
        return searchPrContext(`${pullRequest.repoFullName.replace("/", "--")}--codebase`, pullRequest.title);
    });

    const contextSnippets = await step.run("search-pr-context", async () => {
        return searchPrContext(namespace, pullRequest.title);
    });

    // Fetch PRD and Tasks if linked
    const featureContext = await step.run("fetch-feature-context", async () => {
        let prdContent = "";
        let engineeringTasks = "";
        let featureMetadata = "";

        if (pullRequest.featureId) {
            const [prd] = await db.select().from(prdsTable).where(eq(prdsTable.featureId, pullRequest.featureId)).limit(1);
            if (prd) prdContent = prd.content || "";

            const tasks = await db.select().from(tasksTable).where(eq(tasksTable.featureId, pullRequest.featureId));
            if (tasks.length > 0) {
                engineeringTasks = tasks.map(t => `- [${t.status}] ${t.title}: ${t.description}`).join("\n");
            }
        }
        return { prdContent, engineeringTasks, featureMetadata };
    });

    // Run AI
    const startTime = Date.now();
    const review = await step.run("generate-ai-review", async () => {
        const agent = new ReviewAgent();
        return agent.review({
            diff,
            changedFiles: files.map((f: any) => f.filename).join(", "),
            prdContent: featureContext.prdContent ?? undefined,
            engineeringTasks: featureContext.engineeringTasks ?? undefined,
            featureMetadata: featureContext.featureMetadata ?? undefined,
            repoContextSnippets,
            contextSnippets
        });
    });
    const durationMs = Date.now() - startTime;

    // Post to GitHub
    await step.run("submit-pr-review", async () => {
        await submitPrReview(
            pullRequest.installationId,
            pullRequest.repoFullName,
            pullRequest.prNumber,
            review
        );
    });

    // Save to Database
    await step.run("save-review-run", async () => {
        const attempt = pullRequest.reviewVersion + 1;
        await db.insert(reviewRunsTable).values({
            prId: pullRequestId,
            headSha: pullRequest.headSha,
            attempt,
            score: review.score,
            scoreBreakdown: review.scoreBreakdown,
            verdict: review.verdict,
            model: "anthropic/claude-3-haiku",
            durationMs,
        });

        await db.update(pullRequestsTable).set({
            reviewStatus: "COMPLETED",
            reviewVersion: attempt,
            reviewedAt: new Date(),
        }).where(eq(pullRequestsTable.id, pullRequestId));
    });

    await step.sendEvent("review-completed", {
      name: "notification/review.completed",
      data: { pullRequestId, message: "Review generated successfully." },
    });

    return { pullRequestId, status: "reviewed" };
  }
);
