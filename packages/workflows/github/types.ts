/**
 * Typed webhook payload types for GitHub events.
 */

// ── Issue Events ──────────────────────────────────────────────────────
export type IssueAction =
  | "opened"
  | "closed"
  | "reopened"
  | "assigned"
  | "unassigned"
  | "labeled"
  | "unlabeled"
  | "edited"
  | "deleted"
  | "transferred"
  | "milestoned"
  | "demilestoned";

export type IssueWebhookData = {
  installationId: number;
  repositoryFullName: string;
  action: IssueAction;
  issueNumber: number;
  githubIssueId: number;
  nodeId: string;
  title: string;
  state: "open" | "closed";
  sender: string;
  assignee: string | null;
  labels: string[];
  milestone: string | null;
  htmlUrl: string;
};

// ── Push Events ───────────────────────────────────────────────────────
export type PushCommit = {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
};

export type PushWebhookData = {
  installationId: number;
  repositoryFullName: string;
  ref: string; // e.g. "refs/heads/main"
  before: string; // SHA before push
  after: string; // SHA after push
  sender: string;
  commits: PushCommit[];
  headCommitSha: string | null;
};

// ── Pull Request Review Events ────────────────────────────────────────
export type PrReviewAction = "submitted" | "edited" | "dismissed";

export type PrReviewWebhookData = {
  installationId: number;
  repositoryFullName: string;
  action: PrReviewAction;
  prNumber: number;
  reviewer: string;
  state: "approved" | "changes_requested" | "commented" | "dismissed";
  body: string | null;
  htmlUrl: string;
};

// ── Branch/Tag Events (create/delete) ─────────────────────────────────
export type BranchWebhookData = {
  installationId: number;
  repositoryFullName: string;
  ref: string;
  refType: "branch" | "tag";
  sender: string;
};

// ── PR Event (already exists, typed for consistency) ──────────────────
export type PrWebhookData = {
  installationId: number;
  repositoryFullName: string;
  payload: {
    action: string;
    pull_request: {
      number: number;
      title: string;
      state: string;
      merged: boolean;
      merge_commit_sha: string | null;
      merged_by: { login: string } | null;
      user: { login: string } | null;
      head: { sha: string; ref: string };
      base: { ref: string };
      html_url: string;
      body: string | null;
    };
    repository: { full_name: string };
    installation: { id: number };
    sender: { login: string };
  };
};

// ── Webhook parsing helpers ───────────────────────────────────────────
export function parseIssueWebhook(event: any): IssueWebhookData {
  const issue = event.issue;
  return {
    installationId: event.installation.id,
    repositoryFullName: event.repository.full_name,
    action: event.action,
    issueNumber: issue.number,
    githubIssueId: issue.id,
    nodeId: issue.node_id,
    title: issue.title,
    state: issue.state,
    sender: event.sender.login,
    assignee: issue.assignee?.login ?? null,
    labels: (issue.labels ?? []).map((l: any) => l.name),
    milestone: issue.milestone?.title ?? null,
    htmlUrl: issue.html_url,
  };
}

export function parsePushWebhook(event: any): PushWebhookData {
  return {
    installationId: event.installation.id,
    repositoryFullName: event.repository.full_name,
    ref: event.ref,
    before: event.before,
    after: event.after,
    sender: event.sender.login,
    commits: (event.commits ?? []).map((c: any) => ({
      sha: c.id,
      message: c.message,
      author: c.author?.username ?? c.author?.name ?? "unknown",
      timestamp: c.timestamp,
    })),
    headCommitSha: event.head_commit?.id ?? null,
  };
}

export function parsePrReviewWebhook(event: any): PrReviewWebhookData {
  return {
    installationId: event.installation.id,
    repositoryFullName: event.repository.full_name,
    action: event.action,
    prNumber: event.pull_request.number,
    reviewer: event.review.user.login,
    state: event.review.state,
    body: event.review.body ?? null,
    htmlUrl: event.review.html_url,
  };
}

export function parseBranchWebhook(event: any): BranchWebhookData {
  return {
    installationId: event.installation.id,
    repositoryFullName: event.repository.full_name,
    ref: event.ref,
    refType: event.ref_type,
    sender: event.sender.login,
  };
}
