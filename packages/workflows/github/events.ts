import type {
  IssueWebhookData,
  PushWebhookData,
  PrReviewWebhookData,
  BranchWebhookData,
} from "./types";

export type GithubEvents = {
  "github/sync.requested": {
    data: { repoSyncId: string };
  };
  "github/repository.connected": {
    data: { repositoryId: string };
  };
  "github/issues.sync.requested": {
    data: { featureId: string };
  };
  "github/issues.created": {
    data: { featureId: string; count: number };
  };
  "github/pr.event": {
    data: {
      installationId: number;
      repositoryFullName: string;
      payload: any;
    };
  };

  // ── Two-Way Sync Events ───────────────────────────────────────────────
  "github/issue.event": {
    data: IssueWebhookData;
  };
  "github/push.event": {
    data: PushWebhookData;
  };
  "github/pr-review.event": {
    data: PrReviewWebhookData;
  };
  "github/branch.created": {
    data: BranchWebhookData;
  };
  "github/branch.deleted": {
    data: BranchWebhookData;
  };

  "github/task.status.changed": {
    data: {
      taskId: string;
      featureId: string;
      newStatus: string;
      previousStatus: string;
      source: "issue_closed" | "issue_reopened" | "pr_merged" | "pr_closed" | "manual";
    };
  };
};
