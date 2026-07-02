import { eq, db, and } from "@repo/database";
import { githubInstallationsTable, repositoriesTable, pullRequestsTable } from "@repo/database/schema";
import { App } from "octokit";

export class GithubService {
  private githubApp: App | null = null;

  getGithubApp(): App {
    if (!this.githubApp) {
      const appId = process.env.GITHUB_APP_ID;
      const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
      const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

      if (!appId || !privateKey) {
        throw new Error("Missing GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY environment variables.");
      }

      if (!webhookSecret) {
        throw new Error(
          "Missing GITHUB_WEBHOOK_SECRET environment variable. " +
            "An empty secret makes webhook signature verification ineffective."
        );
      }

      this.githubApp = new App({
        appId,
        privateKey: privateKey.replace(/\\n/g, "\n"),
        webhooks: {
          secret: webhookSecret,
        },
      });
    }

    return this.githubApp;
  }

  getGithubInstallUrl(userId: string): string {
    const appLink =
      process.env.NEXT_PUBLIC_GITHUB_APP_LINK ||
      `https://github.com/apps/${process.env.GITHUB_APP_NAME || "koro-pr"}`;
    const url = new URL(`${appLink}/installations/new`);
    url.searchParams.set("state", userId);
    return url.toString();
  }

  async getInstallationStatus(userId: string) {
    const [installation] = await db
      .select()
      .from(githubInstallationsTable)
      .where(eq(githubInstallationsTable.userId, userId))
      .limit(1);

    if (!installation) {
      return { connected: false, accountLogin: null, installedAt: null };
    }

    return {
      connected: true,
      accountLogin: installation.accountLogin,
      installedAt: installation.createdAt.toISOString(),
    };
  }

  async getUserInstallationId(userId: string): Promise<number | null> {
    const [installation] = await db
      .select({ installationId: githubInstallationsTable.installationId })
      .from(githubInstallationsTable)
      .where(eq(githubInstallationsTable.userId, userId))
      .limit(1);

    return installation?.installationId ?? null;
  }

  async saveInstallation(userId: string, installationId: number): Promise<void> {
    const app = this.getGithubApp();

    const { data } = await app.octokit.request("GET /app/installations/{installation_id}", {
      installation_id: installationId,
    });

    const account = data.account as { login?: string; slug?: string } | null | undefined;
    let accountLogin: string | null = null;
    if (account) {
      if ("login" in account && account.login) {
        accountLogin = account.login;
      } else if (account.slug) {
        accountLogin = account.slug;
      }
    }

    const accountType = data.target_type ?? null;

    await db
      .insert(githubInstallationsTable)
      .values({
        userId,
        installationId,
        accountLogin,
        accountType,
      })
      .onConflictDoUpdate({
        target: githubInstallationsTable.userId,
        set: {
          installationId,
          accountLogin,
          accountType,
          updatedAt: new Date(),
        },
      });
  }

  async deleteInstallation(userId: string): Promise<void> {
    const installationId = await this.getUserInstallationId(userId);
    if (installationId) {
      try {
        const app = this.getGithubApp();
        await app.octokit.request("DELETE /app/installations/{installation_id}", {
          installation_id: installationId,
        });
      } catch (err: any) {
        console.warn(`Failed to delete installation ${installationId} on GitHub:`, err.message);
      }
    }

    await db.delete(githubInstallationsTable).where(eq(githubInstallationsTable.userId, userId));
  }

  async getUserIdByInstallationId(installationId: number): Promise<string | null> {
    const [installation] = await db
      .select({ userId: githubInstallationsTable.userId })
      .from(githubInstallationsTable)
      .where(eq(githubInstallationsTable.installationId, installationId))
      .limit(1);

    return installation?.userId ?? null;
  }

  async syncCodebase(repoSyncId: string) {
    console.log(`[GithubService] Syncing codebase for RepoSync: ${repoSyncId}`);
    return { status: "synced" };
  }

  async listRepositories(userId: string) {
    const installationId = await this.getUserInstallationId(userId);
    if (!installationId) return [];

    const app = this.getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId);

    const { data } = await octokit.request("GET /installation/repositories");
    return data.repositories;
  }

  async connectRepository(organizationId: string, projectId: string, userId: string, repoFullName: string) {
    const installationId = await this.getUserInstallationId(userId);
    if (!installationId) throw new Error("GitHub App not installed");

    const app = this.getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId);

    const [owner, name] = repoFullName.split("/") as [string, string];
    const { data: repo } = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo: name,
    });

    const [connected] = await db
      .insert(repositoriesTable)
      .values({
        organizationId,
        projectId,
        installationId,
        owner,
        name,
        defaultBranch: repo.default_branch,
        private: repo.private,
        syncStatus: "CONNECTED",
      })
      .returning();

    return connected;
  }

  async getConnectedRepository(projectId: string) {
    const [repo] = await db
      .select()
      .from(repositoriesTable)
      .where(eq(repositoriesTable.projectId, projectId))
      .limit(1);
    
    if (!repo) return null;

    const openPrs = await db
      .select({ id: pullRequestsTable.id })
      .from(pullRequestsTable)
      .where(and(eq(pullRequestsTable.repositoryId, repo.id), eq(pullRequestsTable.status, "OPENED")));

    return { ...repo, openPrsCount: openPrs.length };
  }

  async disconnectRepository(projectId: string) {
    await db.delete(repositoriesTable).where(eq(repositoriesTable.projectId, projectId));
  }

  async updateRepositorySyncStatus(repositoryId: string, syncStatus: "CONNECTED" | "SYNCING" | "SYNCED" | "FAILED") {
    await db
      .update(repositoriesTable)
      .set({ syncStatus, updatedAt: new Date() })
      .where(eq(repositoriesTable.id, repositoryId));
  }
}

export default GithubService;
