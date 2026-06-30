"use client";

import React, { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { githubReposInfiniteQuery } from "~/features/github/lib/repos-query";
import { DashboardRepo } from "../lib/types";
import SyncRepoButton from "~/features/repo-sync/components/sync-repo-button";

export function RepoList() {
    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery(githubReposInfiniteQuery);

    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage]);

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading repositories...</div>;
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
    }

    const repos = data?.pages.flatMap((page) => page.repos) ?? [];

    if (repos.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">No repositories found in your installation.</div>;
    }

    return (
        <div className="border rounded-md">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 border-b">
                    <tr>
                        <th className="px-6 py-4">Repository</th>
                        <th className="px-6 py-4">Visibility</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Codebase Context</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {repos.map((repo) => (
                        <tr key={repo.id} className="hover:bg-muted/30">
                            <td className="px-6 py-4 font-medium">{repo.fullName}</td>
                            <td className="px-6 py-4 capitalize">{repo.visibility}</td>
                            <td className="px-6 py-4 capitalize">
                                {repo.syncStatus ? (
                                    <span className={
                                        repo.syncStatus === "synced" ? "text-green-600" :
                                        repo.syncStatus === "failed" ? "text-red-600" : "text-yellow-600"
                                    }>
                                        {repo.syncStatus}
                                    </span>
                                ) : "Unsynced"}
                            </td>
                            <td className="px-6 py-4">
                                <SyncRepoButton 
                                    repoFullName={repo.fullName}
                                    branch={repo.defaultBranch}
                                    syncStatus={repo.syncStatus}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div ref={observerTarget} className="h-10 mt-4 flex items-center justify-center">
                {isFetchingNextPage && <p className="text-muted-foreground text-sm">Loading more...</p>}
            </div>
        </div>
    );
}
