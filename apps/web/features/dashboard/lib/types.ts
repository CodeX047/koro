import { GithubRepo } from "~/features/github/server/repos";
import { RepoSyncStatus } from "~/features/repo-sync/types";

export type DashboardRepo = GithubRepo & {
  syncStatus: RepoSyncStatus | null;
};
