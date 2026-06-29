import { db, eq, and } from "@repo/database";
import { pullRequestsTable } from "@repo/database/schema";

export type PullRequestWebhookPayload = {
  /** Webhook action, e.g. `opened`, `synchronize`, `reopened` */
  action: string;
  /** GitHub App installation that received the event */
  installation: { id: number };
  repository: { full_name: string };
  pull_request: {
    number: number;
    title: string;
    user: { login: string } | null;
    head: { sha: string };
    base: { ref: string };
  };
};

function getAuthorLogin(user: { login: string } | null): string | null {
  if (!user) {
    return null;
  }
  return user.login;
}

export async function savePullRequest(payload: PullRequestWebhookPayload) {
  const repoFullName = payload.repository.full_name;
  const prNumber = payload.pull_request.number;

  const [pullRequest] = await db
    .insert(pullRequestsTable)
    .values({
      installationId: payload.installation.id,
      repoFullName,
      prNumber,
      title: payload.pull_request.title,
      authorLogin: getAuthorLogin(payload.pull_request.user),
      headSha: payload.pull_request.head.sha,
      baseBranch: payload.pull_request.base.ref,
      status: "pending",
    })
    .onConflictDoUpdate({
      target: [pullRequestsTable.repoFullName, pullRequestsTable.prNumber],
      set: {
        title: payload.pull_request.title,
        headSha: payload.pull_request.head.sha,
        status: "pending",
        updatedAt: new Date(),
      },
    })
    .returning();

  return pullRequest;
}
