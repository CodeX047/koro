import * as React from "react";
import { Metadata } from "next";
import { requireAuth } from "~/features/auth/utils/auth";
import { DashboardHeader } from "~/features/dashboard/components/dashboard-header";
import { GithubConnectCard } from "~/features/github/components/github-connect-card";
import { githubService } from "~/features/github/utils/service";

export const metadata: Metadata = {
  title: "GitHub App · Dashboard",
};

export default async function DashboardGithubPage() {
  const session = await requireAuth();
  const installation = await githubService.getInstallationStatus(session.user.id);
  const installUrl = githubService.getGithubInstallUrl(session.user.id);

  return (
    <>
      <DashboardHeader
        title="GitHub App"
        description="Install or disconnect the reviewer app on your GitHub account."
      />
      <GithubConnectCard userId={session.user.id} installation={installation} installUrl={installUrl} />
    </>
  );
}
