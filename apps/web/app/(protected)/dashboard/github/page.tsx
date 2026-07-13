import * as React from "react";
import { Metadata } from "next";
import { requireAuth } from "~/features/auth/utils/auth";
import { GithubConnectCard } from "~/features/github/components/github-connect-card";
import { githubService } from "~/features/github/utils/service";
import { Github } from "lucide-react";

export const metadata: Metadata = {
  title: "GitHub App · Dashboard",
};

export default async function DashboardGithubPage() {
  const session = await requireAuth();
  const installation = await githubService.getInstallationStatus(session.user.id);
  const installUrl = githubService.getGithubInstallUrl(session.user.id);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--koro-on-primary)] flex items-center gap-3">
          <Github className="w-6 h-6 text-[var(--koro-accent)]" />
          GitHub Integration
        </h1>
        <p className="text-[var(--koro-ash)] mt-2 text-sm max-w-2xl">
          Connect Kōro to your GitHub account to enable AI-powered pull request reviews and deep
          codebase analysis.
        </p>
      </div>

      <GithubConnectCard
        userId={session.user.id}
        installation={installation}
        installUrl={installUrl}
      />
    </div>
  );
}
