import { Metadata } from "next";
import { RepoList } from "~/features/dashboard/components/repo-list";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { githubService } from "~/features/github/utils/service";

import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { githubReposInfiniteQuery } from "~/features/github/lib/repos-query";
import { getActivePlan } from "@repo/services/billing/access";
import { db, eq, count } from "@repo/database";
import { repoSyncTable } from "@repo/database/schema";

export const metadata: Metadata = {
    title: "Repositories",
    description: "Manage your GitHub repositories.",
};

export default async function ReposPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        redirect("/sign-in");
    }

    const installationId = await githubService.getUserInstallationId(session.user.id);

    if (!installationId) {
        redirect("/dashboard/github");
    }

    const orgId = session.session.activeOrganizationId;
    let isSyncLimitReached = false;

    if (orgId) {
        const plan = await getActivePlan(orgId);
        if (plan.id === "FREE") {
            const syncedReposCount = await db
                .select({ count: count() })
                .from(repoSyncTable)
                .where(eq(repoSyncTable.installationId, installationId));
            
            const countNum = syncedReposCount[0]?.count || 0;
            if (countNum >= 1) {
                isSyncLimitReached = true;
            }
        }
    }

    const queryClient = new QueryClient();

    // Prefetch the first page on the server
    await queryClient.prefetchInfiniteQuery(githubReposInfiniteQuery);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Repositories</h3>
                <p className="text-sm text-muted-foreground">
                    Repositories accessible by the Koro GitHub App. You can sync their codebases to improve AI review quality.
                </p>
                {isSyncLimitReached && (
                    <div className="mt-2 text-sm text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
                        You are on the Free plan, which allows syncing only 1 repository. Upgrade your plan to sync more repositories.
                    </div>
                )}
            </div>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <RepoList isSyncLimitReached={isSyncLimitReached} />
            </HydrationBoundary>
        </div>
    );
}
