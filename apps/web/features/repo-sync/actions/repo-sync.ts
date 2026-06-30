"use server";

import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { githubService } from "~/features/github/utils/service";

import { triggerRepoSync } from "../server/repo-sync";

export async function syncRepoCodebase(repoFullName: string, branch: string) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        redirect("/sign-in");
    }

    const installationId = await githubService.getUserInstallationId(session.user.id);

    if (!installationId) {
        redirect("/dashboard/github");
    }

    await triggerRepoSync(installationId, repoFullName, branch);
}
