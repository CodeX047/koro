import { Metadata } from "next";
import { RepoList } from "~/features/dashboard/components/repo-list";
import { requireAuth } from "~/features/auth/utils/auth";
import { redirect } from "next/navigation";
import { githubService } from "~/features/github/utils/service";

import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { githubReposInfiniteQuery } from "~/features/github/lib/repos-query";
import { getActivePlan } from "@repo/services/billing/access";
import { db, eq, count } from "@repo/database";
import { repoSyncTable } from "@repo/database/schema";

import { BookMarked, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Repositories",
  description: "Manage your GitHub repositories.",
};

export default async function ReposPage() {
  const session = await requireAuth();

  const installationId = await githubService.getUserInstallationId(session.user.id);

  if (!installationId) {
    redirect("/dashboard/github");
  }

  const orgId = session.session.activeOrganizationId;
  let isSyncLimitReached = false;

  if (orgId) {
    const [plan, syncedReposCount] = await Promise.all([
      getActivePlan(orgId),
      db
        .select({ count: count() })
        .from(repoSyncTable)
        .where(eq(repoSyncTable.installationId, installationId)),
    ]);

    if (plan.id === "FREE") {
      const countNum = syncedReposCount[0]?.count || 0;
      if (countNum >= 1) {
        isSyncLimitReached = true;
      }
    }
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery(githubReposInfiniteQuery);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--koro-on-primary)] flex items-center gap-3">
          <BookMarked className="w-6 h-6 text-[var(--koro-accent)]" />
          Repositories
        </h1>
        <p className="text-[var(--koro-ash)] mt-2 text-sm max-w-2xl">
          Repositories accessible by the Kōro GitHub App. Connect and sync their codebases to
          improve AI review quality and enable repository-wide intelligence.
        </p>

        {isSyncLimitReached && (
          <div className="mt-6 flex items-start gap-3 bg-[var(--koro-surface-dark-elevated)] border border-yellow-500/30 rounded-xl p-4">
            <Info className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium text-yellow-500">Free Plan Limit Reached</span>
              <p className="text-[var(--koro-ash)] mt-1 leading-relaxed">
                You are currently on the Free plan, which supports syncing exactly 1 repository at a
                time. Upgrade your plan to unlock organization-wide sync limits.
              </p>
            </div>
          </div>
        )}
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <RepoList isSyncLimitReached={isSyncLimitReached} />
      </HydrationBoundary>
    </div>
  );
}
