import { inngest } from "../client";
import { db, eq } from "@repo/database";
import { featuresTable, repositoriesTable, tasksTable } from "@repo/database/schema";
import { githubIssueService } from "@repo/services/github/issue";
import GithubService from "@repo/services/github";

const githubService = new GithubService();

export const syncIssues = inngest.createFunction(
  { 
    id: "github-sync-issues", 
    name: "Sync GitHub Issues",
    triggers: [{ event: "github/issues.sync.requested" }],
    concurrency: {
      limit: 1,
      key: "event.data.featureId"
    }
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { featureId } = event.data;

    // 1. Get Project and Repository
    const repo = await step.run("get-repository", async () => {
      const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId)).limit(1);
      if (!feature) throw new Error("Feature not found");

      return await githubService.getConnectedRepository(feature.projectId);
    });

    if (!repo) {
      console.log(`No connected repository for feature ${featureId}. Skipping sync.`);
      return;
    }

    // 2. Mark repo as SYNCING
    await step.run("mark-repo-syncing", async () => {
      await githubService.updateRepositorySyncStatus(repo.id, "SYNCING");
    });

    // 3. Fetch Tasks that are not SYNCED
    const tasks = await step.run("get-pending-tasks", async () => {
      const allTasks = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.featureId, featureId));
        
      return allTasks.filter(t => t.syncStatus !== "SYNCED").map(t => t.id);
    });

    // 4. Batch Create Issues
    const created = await step.run("create-github-issues", async () => {
      return await githubIssueService.syncTasksToIssues(
        repo.id,
        repo.installationId,
        repo.owner,
        repo.name,
        tasks
      );
    });

    // 5. Update Repo Status
    await step.run("mark-repo-synced", async () => {
      await githubService.updateRepositorySyncStatus(repo.id, "SYNCED");
    });

    // 6. Emit completion event
    await step.sendEvent("emit-issues-created", {
      name: "github/issues.created",
      data: { featureId, count: created.length },
    });

    return { created: created.length };
  }
);
