import { inngest } from "../client";
import { db, eq, and, ne, desc } from "@repo/database";
import {
  featuresTable,
  prdsTable,
  clarificationsTable,
  tasksTable,
  pullRequestsTable,
  reviewRunsTable,
  repositoriesTable,
  githubInstallationsTable,
  repoSyncTable,
  commitsTable,
  releaseRunsTable,
  projectsTable,
} from "@repo/database/schema";
import { ReleaseAgent } from "@repo/ai/agents/release";

export const releaseReadiness = inngest.createFunction(
  {
    id: "release-readiness",
    triggers: [{ event: "release/readiness.requested" }],
    retries: 3,
    onFailure: async ({ event }) => {
      const featureId = event.data.event.data.featureId;
      if (featureId) {
        await db
          .update(featuresTable)
          .set({ status: "FAILED" })
          .where(eq(featuresTable.id, featureId));
      }
    },
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { featureId, triggeredBy, triggerType } = event.data;

    // 1. Fetch Feature & Project
    const { feature, project } = await step.run("fetch-feature", async () => {
      const [f] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId));
      if (!f) throw new Error(`Feature ${featureId} not found`);
      const [p] = await db.select().from(projectsTable).where(eq(projectsTable.id, f.projectId));
      if (!p) throw new Error(`Project ${f.projectId} not found`);
      return { feature: f, project: p };
    });

    // Update status to pending
    await step.run("set-status-pending", async () => {
      await db
        .update(featuresTable)
        .set({ status: "RELEASE_PENDING" })
        .where(eq(featuresTable.id, featureId));
    });

    // 2. Fetch PRD
    const prd = await step.run("fetch-prd", async () => {
      const [p] = await db.select().from(prdsTable).where(eq(prdsTable.featureId, featureId));
      return p;
    });

    // 3. Fetch Clarifications
    const clarifications = await step.run("fetch-clarifications", async () => {
      return db
        .select()
        .from(clarificationsTable)
        .where(eq(clarificationsTable.featureId, featureId));
    });

    // 4. Fetch Tasks
    const tasks = await step.run("fetch-tasks", async () => {
      return db.select().from(tasksTable).where(eq(tasksTable.featureId, featureId));
    });

    // 5. Fetch Repository & Organization
    const repository = await step.run("fetch-repository", async () => {
      const [repo] = await db
        .select()
        .from(repositoriesTable)
        .where(eq(repositoriesTable.projectId, feature.projectId));
      return repo;
    });

    // 6. Fetch Infrastructure Health
    const infraHealth = await step.run("fetch-infrastructure", async () => {
      if (!repository) return { hasInstallation: false, isSynced: false };
      const [installation] = await db
        .select()
        .from(githubInstallationsTable)
        .where(eq(githubInstallationsTable.installationId, repository.installationId));
      const [sync] = await db
        .select()
        .from(repoSyncTable)
        .where(eq(repoSyncTable.repoFullName, `${repository.owner}/${repository.name}`));

      return {
        hasInstallation: !!installation,
        isSynced: sync?.status === "synced",
      };
    });

    // 7. Fetch Pull Requests
    const prs = await step.run("fetch-pull-requests", async () => {
      return db.select().from(pullRequestsTable).where(eq(pullRequestsTable.featureId, featureId));
    });

    // 8. Fetch Review Runs & Commits
    const { reviewRuns, commits } = await step.run("fetch-review-runs-commits", async () => {
      const prIds = prs.map((pr: any) => pr.id);
      if (prIds.length === 0) return { reviewRuns: [], commits: [] };

      const runs = [];
      for (const prId of prIds) {
        const [latestRun] = await db
          .select()
          .from(reviewRunsTable)
          .where(eq(reviewRunsTable.prId, prId))
          .orderBy(desc(reviewRunsTable.createdAt))
          .limit(1);
        if (latestRun) runs.push(latestRun);
      }

      let allCommits: any[] = [];
      for (const prId of prIds) {
        const prCommits = await db.select().from(commitsTable).where(eq(commitsTable.prId, prId));
        allCommits = allCommits.concat(prCommits);
      }

      return { reviewRuns: runs, commits: allCommits };
    });

    // 9. Deterministic Checks
    const {
      verdict: deterministicVerdict,
      failedChecks,
      passedChecks,
    } = await step.run("run-deterministic-checks", async () => {
      const failed: string[] = [];
      const passed: string[] = [];

      // Repo check
      if (!repository) failed.push("No repository connected to this project.");
      else passed.push("Repository is connected.");

      // Infra check
      if (!infraHealth.hasInstallation) failed.push("GitHub App installation is missing.");
      else passed.push("GitHub App is installed.");

      if (!infraHealth.isSynced) failed.push("Repository is not fully synced.");
      else passed.push("Repository sync is healthy.");

      // PRD check
      if (!prd) failed.push("No Product Requirements Document (PRD) found.");
      else passed.push("PRD exists.");

      // PR check
      const openPrs = prs.filter((pr: any) => !pr.merged && pr.status !== "CLOSED");
      if (openPrs.length > 0) failed.push(`${openPrs.length} open pull request(s) exist.`);
      else if (prs.length > 0) passed.push("All pull requests are merged or closed.");

      // Review finding check
      const blockingRuns = reviewRuns.filter((run: any) => run.verdict === "REQUEST_CHANGES");
      if (blockingRuns.length > 0)
        failed.push(`${blockingRuns.length} PR(s) have blocking review findings.`);
      else if (reviewRuns.length > 0) passed.push("No blocking review findings.");

      // Task check
      const requiredTasks = tasks.filter((t: any) => t.priority !== "LOW");
      const incompleteTasks = requiredTasks.filter((t: any) => t.status !== "DONE");
      if (incompleteTasks.length > 0)
        failed.push(`${incompleteTasks.length} required engineering task(s) are incomplete.`);
      else if (requiredTasks.length > 0)
        passed.push("All required engineering tasks are completed.");

      // Warning check
      let verdict = "READY";
      if (failed.length > 0) {
        verdict = "NOT_READY";
      } else {
        const incompleteLowTasks = tasks.filter(
          (t: any) => t.priority === "LOW" && t.status !== "DONE",
        );
        const minorFindingRuns = reviewRuns.filter((run: any) => run.verdict === "COMMENT");
        if (incompleteLowTasks.length > 0 || minorFindingRuns.length > 0) {
          verdict = "READY_WITH_WARNINGS";
        }
      }

      return { verdict, failedChecks: failed, passedChecks: passed };
    });

    // 10. Calculate Score
    const { score, breakdown } = await step.run("calculate-score", async () => {
      // Requirements (30%)
      const acCount = prd?.acceptanceCriteria?.length || 0;
      let reqScore = acCount > 0 ? 100 : 0; // simplified, ideally map AC to tasks

      // Tasks (20%)
      const completedTasks = tasks.filter((t: any) => t.status === "DONE").length;
      const tasksScore = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

      // GitHub (15%)
      const mergedPrs = prs.filter((pr: any) => pr.merged).length;
      const prScore = prs.length > 0 ? Math.round((mergedPrs / prs.length) * 100) : 100;

      // Review Health (25%)
      let reviewHealthScore = 100;
      if (reviewRuns.length > 0) {
        const total = reviewRuns.reduce((sum: number, run: any) => sum + (run.score || 0), 0);
        reviewHealthScore = Math.round(total / reviewRuns.length);
      } else if (prs.length > 0) {
        reviewHealthScore = 0; // PRs exist but no review runs
      }

      // Risk (10%)
      let riskScore = 100;
      const blocking = reviewRuns.filter((r: any) => r.verdict === "REQUEST_CHANGES").length;
      const major = 0; // We don't have severity breakdown in the DB run easily accessible here without parsing
      const minor = reviewRuns.filter((r: any) => r.verdict === "COMMENT").length;
      riskScore = Math.max(0, 100 - blocking * 25 - major * 10 - minor * 2);

      const finalScore = Math.round(
        reqScore * 0.3 +
          reviewHealthScore * 0.25 +
          tasksScore * 0.2 +
          prScore * 0.15 +
          riskScore * 0.1,
      );

      return {
        score: finalScore,
        breakdown: {
          requirements: reqScore,
          reviewHealth: reviewHealthScore,
          tasks: tasksScore,
          github: prScore,
          risk: riskScore,
        },
      };
    });

    // 11. Run AI Agent (skip if NOT_READY and we don't want to waste tokens, but let's run it anyway for analysis of the failure)
    const startTime = Date.now();
    const aiResult = await step.run("run-release-agent", async () => {
      const agent = new ReleaseAgent();

      const featureMeta = `Title: ${feature.title}\nDescription: ${feature.description}`;
      const qa = clarifications.map((c: any) => `Q: ${c.question}\nA: ${c.answer}`).join("\n\n");
      const taskStr = tasks.map((t: any) => `[${t.status}] ${t.title} (${t.priority})`).join("\n");

      const notes = [
        ...prs.filter((pr: any) => pr.merged).map((pr: any) => `PR: ${pr.title}`),
        ...commits.map((c: any) => `Commit: ${c.message}`),
      ].join("\n");

      const runStr = reviewRuns
        .map((r: any) => `PR Score: ${r.score} | Verdict: ${r.verdict}`)
        .join("\n");
      const checksStr = `Passed:\n${passedChecks.join("\n")}\nFailed:\n${failedChecks.join("\n")}`;
      const scoreStr = `Total: ${score}\nBreakdown: ${JSON.stringify(breakdown)}`;

      return agent.evaluate({
        featureMetadata: featureMeta,
        clarifications: qa,
        prdContent: prd?.content || "No PRD",
        tasks: taskStr,
        releaseNotesRaw: notes,
        reviewRuns: runStr,
        deterministicChecks: checksStr,
        computedScore: scoreStr,
      });
    });
    const durationMs = Date.now() - startTime;

    // 12. Persist Release Run
    await step.run("persist-release-run", async () => {
      await db.insert(releaseRunsTable).values({
        featureId,
        organizationId: project.organizationId,
        overallScore: score,
        scoreBreakdown: breakdown,
        verdict: deterministicVerdict,
        summary: aiResult.summary,
        missingRequirements: aiResult.missingRequirements,
        risks: aiResult.risks,
        passedChecks,
        failedChecks,
        releaseNotes: aiResult.releaseNotes,
        recommendations: aiResult.recommendations,
        triggeredBy: triggeredBy || "system",
        triggerType: triggerType || "automatic",
        model: "openrouter/free",
        durationMs,
      });
    });

    // 13. Update Feature Status
    await step.run("update-feature-status", async () => {
      await db
        .update(featuresTable)
        .set({ status: "READY_FOR_RELEASE" }) // It's "ready for release" tab, let the UI decide if it can actually be released based on verdict
        .where(eq(featuresTable.id, featureId));
    });

    // 14. Emit Event
    await step.sendEvent("release-completed", {
      name: "release/readiness.completed",
      data: { featureId, verdict: deterministicVerdict, score },
    });

    return { featureId, verdict: deterministicVerdict, score };
  },
);
