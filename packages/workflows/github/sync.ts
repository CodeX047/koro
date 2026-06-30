import { inngest } from "../client";
import { GithubService } from "@repo/services/github";

const githubService = new GithubService();

export const githubSync = inngest.createFunction(
  { 
    id: "sync-repo-codebase", 
    triggers: [{ event: "github/sync.requested" }],
    retries: 3, 
    concurrency: { limit: 2 } 
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { repoSyncId } = event.data;

    return await step.run("execute-sync", async () => {
      // Delegate to service layer
      return await githubService.syncCodebase(repoSyncId);
    });
  }
);
