import { eq, and, db, inArray } from "@repo/database";
import {
  pullRequestsTable,
  changedFilesTable,
  commitsTable,
  repositoriesTable,
  tasksTable,
  githubIssuesTable,
} from "@repo/database/schema";
import { GithubService } from "./index";

export class GithubPullRequestService {
  private githubService: GithubService;

  constructor() {
    this.githubService = new GithubService();
  }

  async processPullRequestEvent(installationId: number, repositoryId: string, payload: any) {
    const pr = payload.pull_request;
    const action = payload.action; // opened, closed, reopened, synchronize
    const repoFullName = payload.repository.full_name;

    // 1. Attempt to match PR to Tasks
    let taskId: string | null = null;
    let featureId: string | null = null;

    // Parse all issue numbers from body and title
    const issueNumbers: number[] = [];
    const bodyMatches = pr.body ? [...pr.body.matchAll(/#(\d+)/g)] : [];
    const titleMatches = pr.title ? [...pr.title.matchAll(/#(\d+)/g)] : [];

    for (const m of [...bodyMatches, ...titleMatches]) {
      const num = parseInt(m[1]);
      if (!issueNumbers.includes(num)) {
        issueNumbers.push(num);
      }
    }

    let matchedTasks: any[] = [];
    if (issueNumbers.length > 0) {
      const issues = await db
        .select()
        .from(githubIssuesTable)
        .where(inArray(githubIssuesTable.issueNumber, issueNumbers));

      const taskIds = issues.map((i) => i.taskId);
      if (taskIds.length > 0) {
        matchedTasks = await db.select().from(tasksTable).where(inArray(tasksTable.id, taskIds));

        if (matchedTasks.length > 0) {
          taskId = matchedTasks[0].id;
          featureId = matchedTasks[0].featureId;
        }
      }
    }

    // 1c. Update task statuses based on PR state
    const statusChanges: Array<{
      taskId: string;
      featureId: string;
      newStatus: string;
      previousStatus: string;
      source: "pr_merged" | "pr_closed";
    }> = [];

    if (matchedTasks.length > 0) {
      let newTaskStatus: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED" | null = null;
      let newGithubState: string | null = null;
      let newIssueState: "open" | "closed" | null = null;

      if (pr.state === "closed" && pr.merged) {
        newTaskStatus = "DONE";
        newGithubState = "CLOSED";
        newIssueState = "closed";
      } else if (pr.state === "closed" && !pr.merged) {
        newTaskStatus = "IN_PROGRESS";
        newGithubState = "OPEN";
        newIssueState = "open";
      } else if (pr.state === "open") {
        newTaskStatus = "REVIEW";
        newGithubState = "REVIEW";
        newIssueState = "open";
      }

      if (newTaskStatus) {
        const taskIdsToUpdate = matchedTasks.map((t) => t.id);
        await db
          .update(tasksTable)
          .set({
            status: newTaskStatus,
            githubState: newGithubState,
            githubUpdatedAt: new Date(),
            completedAt: newTaskStatus === "DONE" ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(inArray(tasksTable.id, taskIdsToUpdate));

        if (newIssueState) {
          await db
            .update(githubIssuesTable)
            .set({
              state: newIssueState,
              closedAt: newIssueState === "closed" ? new Date() : null,
              updatedAt: new Date(),
            })
            .where(inArray(githubIssuesTable.taskId, taskIdsToUpdate));
        }

        // Collect status changes for the caller to emit domain events
        const source = pr.merged ? "pr_merged" : "pr_closed";
        for (const t of matchedTasks) {
          if (t.featureId) {
            statusChanges.push({
              taskId: t.id,
              featureId: t.featureId,
              newStatus: newTaskStatus,
              previousStatus: t.status,
              source: source as "pr_merged" | "pr_closed",
            });
          }
        }
      }
    }

    // 2. Save or update the PR
    let status = "OPENED";
    if (pr.state === "closed" && pr.merged) {
      status = "MERGED";
    } else if (pr.state === "closed" && !pr.merged) {
      status = "CLOSED";
    }

    let [existingPr] = await db
      .select()
      .from(pullRequestsTable)
      .where(
        and(
          eq(pullRequestsTable.repoFullName, repoFullName),
          eq(pullRequestsTable.prNumber, pr.number),
        ),
      )
      .limit(1);

    if (existingPr) {
      [existingPr] = await db
        .update(pullRequestsTable)
        .set({
          status,
          merged: pr.merged,
          mergedBy: pr.merged ? (pr.merged_by?.login ?? null) : null,
          mergedAt: pr.merged ? new Date() : null,
          headSha: pr.head.sha,
          lastCommitSha: pr.head.sha,
          title: pr.title,
          updatedAt: new Date(),
        })
        .where(eq(pullRequestsTable.id, existingPr.id))
        .returning();
    } else {
      [existingPr] = await db
        .insert(pullRequestsTable)
        .values({
          installationId,
          repoFullName,
          repositoryId,
          taskId,
          featureId,
          prNumber: pr.number,
          title: pr.title,
          url: pr.html_url,
          authorLogin: pr.user.login,
          headSha: pr.head.sha,
          headBranch: pr.head.ref,
          baseBranch: pr.base.ref,
          status,
          merged: pr.merged,
        })
        .returning();
    }

    // 3. Fetch changed files and commits using Octokit
    if (existingPr && ["opened", "synchronize"].includes(action)) {
      await this.syncPullRequestDetails(installationId, existingPr.id, repoFullName, pr.number);
    }

    return { pr: existingPr, statusChanges };
  }

  private async syncPullRequestDetails(
    installationId: number,
    prId: string,
    repoFullName: string,
    prNumber: number,
  ) {
    const app = this.githubService.getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId);
    const [owner, repo] = repoFullName.split("/") as [string, string];

    // Sync Files
    const { data: files } = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
      {
        owner,
        repo,
        pull_number: prNumber,
      },
    );

    await db.delete(changedFilesTable).where(eq(changedFilesTable.prId, prId));

    if (files.length > 0) {
      const filesToInsert = files.map((f) => ({
        prId,
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch,
      }));
      await db.insert(changedFilesTable).values(filesToInsert);
    }

    // Sync Commits
    const { data: commits } = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
      {
        owner,
        repo,
        pull_number: prNumber,
      },
    );

    await db.delete(commitsTable).where(eq(commitsTable.prId, prId));

    if (commits.length > 0) {
      const commitsToInsert = commits.map((c) => ({
        prId,
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author?.name || c.author?.login || null,
        timestamp: c.commit.author?.date ? new Date(c.commit.author.date) : new Date(),
      }));
      await db.insert(commitsTable).values(commitsToInsert);
    }
  }
}

export const githubPullRequestService = new GithubPullRequestService();
