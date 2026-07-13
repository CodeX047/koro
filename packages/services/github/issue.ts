import { eq, inArray, db } from "@repo/database";
import { tasksTable, githubIssuesTable } from "@repo/database/schema";
import { GithubService } from "./index";

export class GithubIssueService {
  private githubService: GithubService;

  constructor() {
    this.githubService = new GithubService();
  }

  async syncTasksToIssues(
    repositoryId: string,
    installationId: number,
    owner: string,
    name: string,
    taskIds: string[],
  ) {
    if (taskIds.length === 0) return [];

    const tasks = await db.select().from(tasksTable).where(inArray(tasksTable.id, taskIds));

    const app = this.githubService.getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId);

    const createdIssues = [];

    for (const task of tasks) {
      // Check if issue already exists
      const [existing] = await db
        .select()
        .from(githubIssuesTable)
        .where(eq(githubIssuesTable.taskId, task.id))
        .limit(1);

      if (existing) continue;

      try {
        const body = `**Description**\n${task.description || "No description provided."}\n\n**Reason**\n${task.reason || "No reason provided."}\n\n---\n*Created by Kōro Planning*`;

        const { data: issue } = await octokit.request("POST /repos/{owner}/{repo}/issues", {
          owner,
          repo: name,
          title: `[${task.category.toUpperCase()}] ${task.title}`,
          body,
        });

        const [created] = await db
          .insert(githubIssuesTable)
          .values({
            taskId: task.id,
            githubIssueId: issue.id,
            issueNumber: issue.number,
            url: issue.html_url,
            nodeId: issue.node_id,
            state: issue.state,
            lastSyncedAt: new Date(),
          })
          .returning();

        await db
          .update(tasksTable)
          .set({ syncStatus: "SYNCED", updatedAt: new Date() })
          .where(eq(tasksTable.id, task.id));

        createdIssues.push(created);
      } catch (err: any) {
        console.error(`Failed to create issue for task ${task.id}:`, err.message);
        await db
          .update(tasksTable)
          .set({ syncStatus: "FAILED", updatedAt: new Date() })
          .where(eq(tasksTable.id, task.id));
      }
    }

    return createdIssues;
  }
}

export const githubIssueService = new GithubIssueService();
