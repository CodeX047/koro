"use client";

import * as React from "react";
import { ArrowSquareOut, GithubLogo, Plugs } from "@phosphor-icons/react";

import type { GithubInstallationStatus } from "~/app/(protected)/dashboard/lib/types";
import { statusBadge, statusButtonClass } from "~/app/(protected)/dashboard/lib/status-style";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { disconnectGithubApp } from "../actions";

type GithubConnectCardProps = {
  userId: string;
  installation: GithubInstallationStatus;
  installUrl: string;
};

function ConnectedDetails({ accountLogin }: { accountLogin: string | null }) {
  return (
    <p className="text-xs text-[var(--koro-ash)]">
      Installed for{" "}
      <span className="font-semibold text-[var(--koro-success)]">@{accountLogin}</span>. The app can
      read repository metadata and post review comments on pull requests.
    </p>
  );
}

function DisconnectedDetails() {
  return (
    <ul className="list-inside list-disc space-y-1 text-xs text-[var(--koro-ash)]">
      <li>Access public and private repositories you select</li>
      <li>Receive webhooks for pull request events</li>
      <li>Post AI-generated review comments on PRs</li>
    </ul>
  );
}

function ConnectedActions() {
  return (
    <form action={disconnectGithubApp}>
      <Button type="submit" variant="outline" className={statusButtonClass.danger}>
        <Plugs />
        Disconnect GitHub App
      </Button>
    </form>
  );
}

function DisconnectedActions({ installUrl }: { installUrl: string }) {
  return (
    <Button asChild className={statusButtonClass.success}>
      <a href={installUrl}>
        <GithubLogo />
        Install GitHub App
        <ArrowSquareOut className="size-3 opacity-80" />
      </a>
    </Button>
  );
}

function ConnectionDetails({
  connected,
  accountLogin,
}: {
  connected: boolean;
  accountLogin: string | null;
}) {
  if (connected) {
    return <ConnectedDetails accountLogin={accountLogin} />;
  }

  return <DisconnectedDetails />;
}

function ConnectionActions({ connected, installUrl }: { connected: boolean; installUrl: string }) {
  if (connected) {
    return <ConnectedActions />;
  }

  return <DisconnectedActions installUrl={installUrl} />;
}

export function GithubConnectCard({
  userId: _userId,
  installation,
  installUrl,
}: GithubConnectCardProps) {
  const { connected, accountLogin } = installation;

  // Default to neutral styling; switch to green when connected
  let cardBorderClass = "border-[var(--koro-hairline-strong)]";
  let iconWrapperClass =
    "border-[var(--koro-hairline-strong)] bg-[var(--koro-surface-dark-elevated)] text-[var(--koro-ash)]";
  let statusTone: "success" | "neutral" = "neutral";
  let statusLabel = "Not connected";

  if (connected) {
    cardBorderClass = "border-[var(--koro-success)]/30";
    iconWrapperClass =
      "border-[var(--koro-success)]/40 bg-[var(--koro-success)]/10 text-[var(--koro-success)]";
    statusTone = "success";
    statusLabel = "Connected";
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Card
        className={cn("max-w-2xl bg-[var(--koro-surface-dark)] transition-colors", cardBorderClass)}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-none border",
                  iconWrapperClass,
                )}
              >
                <GithubLogo className="size-5" />
              </span>
              <div>
                <CardTitle className="text-base font-bold text-[var(--koro-on-primary)]">
                  GitHub App
                </CardTitle>
                <CardDescription className="text-xs text-[var(--koro-ash)] mt-1">
                  Install the Koro reviewer app on your GitHub account or organization to access
                  public and private repositories.
                </CardDescription>
              </div>
            </div>
            <span className={statusBadge(statusTone)}>{statusLabel}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConnectionDetails connected={connected} accountLogin={accountLogin} />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t border-[var(--koro-hairline-strong)]">
          <ConnectionActions connected={connected} installUrl={installUrl} />
        </CardFooter>
      </Card>
    </div>
  );
}
