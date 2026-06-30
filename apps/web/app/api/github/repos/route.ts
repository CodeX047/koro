import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { githubService } from "~/features/github/utils/service";
import { getInstallationReposPage } from "~/features/github/server/repos";
import { getRepoSyncStatuses } from "~/features/repo-sync/server/repo-sync";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const installationId = await githubService.getUserInstallationId(session.user.id);

    if (!installationId) {
        return NextResponse.json({ error: "GitHub App not connected" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

    const data = await getInstallationReposPage(installationId, page);
    const repoFullNames = data.repos.map((repo: any) => repo.fullName);
    const syncStatuses = await getRepoSyncStatuses(repoFullNames);

    const repos = data.repos.map((repo: any) => ({
        ...repo,
        syncStatus: syncStatuses[repo.fullName] ?? null
    }));

    return NextResponse.json({ ...data, repos });
}
