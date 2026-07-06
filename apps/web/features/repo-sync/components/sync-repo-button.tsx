"use client";

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { githubRepoKeys } from '~/features/github/lib/repos-query';
import { syncRepoCodebase } from '../actions/repo-sync';
import { Button } from '~/components/ui/button';
import { RepoSyncStatus } from '../types';
import { toast } from 'sonner';

type SyncRepoButtonProps = {
    repoFullName: string;
    branch: string;
    syncStatus: RepoSyncStatus | null;
    isSyncLimitReached?: boolean;
};

function isSyncing(status: RepoSyncStatus | null, mutationPending: boolean) {
    if (mutationPending) {
        return true;
    }
    return status === "pending" || status === "syncing";
}

function getButtonLabel(status: RepoSyncStatus | null, mutationPending: boolean) {
    if (isSyncing(status, mutationPending)) {
        return "Syncing…";
    }
    if (status === "synced") {
        return "Re-sync";
    }
    return "Sync";
}

export default function SyncRepoButton({ repoFullName, branch, syncStatus, isSyncLimitReached = false }: SyncRepoButtonProps) {
    const queryClient = useQueryClient();

    const syncRepo = useMutation({
        mutationFn: () => syncRepoCodebase(repoFullName, branch),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: githubRepoKeys.all });
            toast.success(`Repo ${repoFullName} sync started successfully`);
        },
        onError: (error) => {
            toast.error(`Failed to sync repo ${repoFullName}: ${error.message}`);
        }
    });

    const syncing = isSyncing(syncStatus, syncRepo.isPending);
    const isUnsynced = !syncStatus;
    const disabled = syncing || (isSyncLimitReached && isUnsynced);

    return (
        <Button
            size="sm"
            variant={status === "synced" ? "outline" : "default"}
            className={status === "synced" ? "bg-[var(--koro-surface-dark)] border-[var(--koro-hairline-strong)] text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] hover:bg-[var(--koro-surface-dark-elevated)]" : "bg-[var(--koro-accent)] text-black hover:bg-[var(--koro-accent)] hover:opacity-90"}
            disabled={disabled}
            onClick={() => syncRepo.mutate()}
            title={isSyncLimitReached && isUnsynced ? "Free plan limit reached. Upgrade to sync more repositories." : undefined}
        >
            {getButtonLabel(syncStatus, syncRepo.isPending)}
        </Button>
    );
}
