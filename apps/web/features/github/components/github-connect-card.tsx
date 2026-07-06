"use client";

import * as React from "react";
import { Github, ExternalLink, Unplug, CheckCircle2, Shield, Zap, GitPullRequest } from "lucide-react";

import type { GithubInstallationStatus } from "~/app/(protected)/dashboard/lib/types";
import { cn } from "~/lib/utils";
import { disconnectGithubApp } from "../actions";

type GithubConnectCardProps = {
  userId: string;
  installation: GithubInstallationStatus;
  installUrl: string;
};

export function GithubConnectCard({
  userId: _userId,
  installation,
  installUrl,
}: GithubConnectCardProps) {
  const { connected, accountLogin } = installation;

  return (
    <div className={cn(
      "relative overflow-hidden border rounded-2xl p-6 md:p-8 transition-all duration-300",
      connected 
        ? "bg-[var(--koro-surface-dark-elevated)] border-green-500/30" 
        : "bg-[var(--koro-surface-dark)] border-[var(--koro-hairline-strong)]"
    )}>
      {/* Decorative background element */}
      <div className={cn(
        "absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none transition-all duration-700",
        connected ? "bg-green-500" : "bg-[var(--koro-accent)]"
      )} />

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="flex items-start gap-5">
          <div className={cn(
            "p-3 rounded-xl shrink-0 mt-1",
            connected 
              ? "bg-green-500/10 text-green-500 border border-green-500/20" 
              : "bg-[var(--koro-surface-dark-elevated)] text-[var(--koro-on-primary)] border border-[var(--koro-hairline-strong)]"
          )}>
            <Github className="w-8 h-8" />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-[var(--koro-on-primary)]">
                GitHub App
              </h2>
              {connected ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium tracking-wide">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] text-[var(--koro-ash)] text-xs font-medium tracking-wide uppercase">
                  Not Connected
                </span>
              )}
            </div>
            
            {connected ? (
              <p className="text-[var(--koro-ash)] text-sm leading-relaxed max-w-lg">
                Installed and active for <span className="font-semibold text-[var(--koro-on-primary)]">@{accountLogin}</span>. 
                Kōro is continuously monitoring your repositories for new pull requests and codebase updates.
              </p>
            ) : (
              <p className="text-[var(--koro-ash)] text-sm leading-relaxed max-w-lg">
                Install the Kōro GitHub app to authorize repository access. This allows us to read your code and post AI reviews directly to your pull requests.
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          {connected ? (
            <form action={disconnectGithubApp}>
              <button 
                type="submit" 
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium transition-colors text-sm cursor-pointer"
              >
                <Unplug className="w-4 h-4" />
                Disconnect App
              </button>
            </form>
          ) : (
            <a 
              href={installUrl}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--koro-accent)] hover:opacity-90 text-black font-semibold transition-opacity text-sm cursor-pointer"
            >
              <Github className="w-4 h-4" />
              Connect to GitHub
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>
          )}
        </div>
      </div>

      {!connected && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-[var(--koro-hairline-strong)]">
          <div className="flex flex-col gap-2">
            <Shield className="w-5 h-5 text-[var(--koro-accent)]" />
            <h3 className="text-sm font-medium text-[var(--koro-on-primary)]">Granular Permissions</h3>
            <p className="text-xs text-[var(--koro-ash)] leading-relaxed">
              You choose exactly which repositories Kōro can access. We only ask for the minimum permissions required.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Zap className="w-5 h-5 text-[var(--koro-accent)]" />
            <h3 className="text-sm font-medium text-[var(--koro-on-primary)]">Real-time Webhooks</h3>
            <p className="text-xs text-[var(--koro-ash)] leading-relaxed">
              We instantly receive events when PRs are opened, ensuring blazing fast AI reviews.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <GitPullRequest className="w-5 h-5 text-[var(--koro-accent)]" />
            <h3 className="text-sm font-medium text-[var(--koro-on-primary)]">Inline PR Comments</h3>
            <p className="text-xs text-[var(--koro-ash)] leading-relaxed">
              Reviews are posted directly to your GitHub PRs, right where your developers already work.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
