import { Metadata } from "next";
import { RepoList } from "~/features/dashboard/components/repo-list";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { githubService } from "~/features/github/utils/service";

import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { githubReposInfiniteQuery } from "~/features/github/lib/repos-query";

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
            </div>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <RepoList />
            </HydrationBoundary>
        </div>
    );
}
