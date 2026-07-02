import { eq, and, db } from "@repo/database";
import { pullRequestsTable, changedFilesTable, commitsTable, repositoriesTable, tasksTable, githubIssuesTable } from "@repo/database/schema";
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

    // 1. Attempt to match PR to a Task
    let taskId: string | null = null;
    let featureId: string | null = null;

    // 1a. Try to match by branch name (e.g., feature/auth-14)
    const branchName = pr.head.ref;
    // We could extract taskId if we encoded it in the branch name

    // 1b. Try to match by linked issue number in body or title
    const issueMatch = pr.body?.match(/#(\d+)/) || pr.title?.match(/#(\d+)/);
    if (issueMatch) {
      const issueNumber = parseInt(issueMatch[1]);
      const [issue] = await db
        .select()
        .from(githubIssuesTable)
        .where(eq(githubIssuesTable.issueNumber, issueNumber))
        .limit(1);

      if (issue) {
        taskId = issue.taskId;
        const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId)).limit(1);
        if (task) {
          featureId = task.featureId;
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
      .where(and(eq(pullRequestsTable.repoFullName, repoFullName), eq(pullRequestsTable.prNumber, pr.number)))
      .limit(1);

    if (existingPr) {
      [existingPr] = await db
        .update(pullRequestsTable)
        .set({
          status,
          merged: pr.merged,
          headSha: pr.head.sha,
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

    return existingPr;
  }

  private async syncPullRequestDetails(installationId: number, prId: string, repoFullName: string, prNumber: number) {
    const app = this.githubService.getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId);
    const [owner, repo] = repoFullName.split("/") as [string, string];

    // Sync Files
    const { data: files } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/files", {
      owner,
      repo,
      pull_number: prNumber,
    });

    await db.delete(changedFilesTable).where(eq(changedFilesTable.prId, prId));
    
    if (files.length > 0) {
      const filesToInsert = files.map(f => ({
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
    const { data: commits } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/commits", {
      owner,
      repo,
      pull_number: prNumber,
    });

    await db.delete(commitsTable).where(eq(commitsTable.prId, prId));

    if (commits.length > 0) {
      const commitsToInsert = commits.map(c => ({
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
