"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { githubReposInfiniteQuery } from "~/features/github/lib/repos-query";
import { Github, Globe, Lock, Loader2, Database, AlertCircle, CheckCircle2, Search, Filter } from "lucide-react";

import SyncRepoButton from "~/features/repo-sync/components/sync-repo-button";

export function RepoList({ isSyncLimitReached = false }: { isSyncLimitReached?: boolean }) {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(githubReposInfiniteQuery);

  const observerTarget = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [syncFilter, setSyncFilter] = useState<"all" | "synced" | "unsynced">("all");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl">
        <Loader2 className="w-8 h-8 text-[var(--koro-accent)] animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  const allRepos = data?.pages.flatMap((page) => page.repos) ?? [];
  
  const filteredRepos = allRepos.filter(repo => {
    // Search filter
    if (searchQuery && !repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Visibility filter
    if (visibilityFilter !== "all" && repo.visibility !== visibilityFilter) {
      return false;
    }
    
    // Sync filter
    const isSynced = repo.syncStatus === "synced";
    if (syncFilter === "synced" && !isSynced) {
      return false;
    }
    if (syncFilter === "unsynced" && isSynced) {
      return false;
    }
    
    return true;
  });

  if (allRepos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl">
        <Database className="w-12 h-12 text-[var(--koro-ash)] opacity-50 mb-4" />
        <h3 className="text-[var(--koro-on-primary)] font-medium mb-1">No repositories found</h3>
        <p className="text-[var(--koro-ash)] text-sm max-w-sm">We couldn't find any repositories connected to your GitHub App installation.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--koro-ash)] pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search repositories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--koro-on-primary)] placeholder:text-[var(--koro-ash)] focus:outline-none focus:border-[var(--koro-accent)] transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--koro-ash)] pointer-events-none" />
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as any)}
              className="appearance-none bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-lg pl-9 pr-8 py-2 text-sm text-[var(--koro-on-primary)] focus:outline-none focus:border-[var(--koro-accent)] transition-all cursor-pointer"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--koro-ash)] pointer-events-none" />
            <select
              value={syncFilter}
              onChange={(e) => setSyncFilter(e.target.value as any)}
              className="appearance-none bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-lg pl-9 pr-8 py-2 text-sm text-[var(--koro-on-primary)] focus:outline-none focus:border-[var(--koro-accent)] transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="synced">Synced Only</option>
              <option value="unsynced">Unsynced Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filteredRepos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[var(--koro-hairline-strong)] rounded-xl">
            <Search className="w-8 h-8 text-[var(--koro-ash)] opacity-50 mb-3" />
            <p className="text-[var(--koro-on-primary)] font-medium text-sm">No repositories match your filters</p>
            <p className="text-[var(--koro-ash)] text-xs mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          filteredRepos.map((repo) => {
            const isSynced = repo.syncStatus === "synced";
            const isFailed = repo.syncStatus === "failed";
            const isSyncing = repo.syncStatus === "syncing" || repo.syncStatus === "pending";
            
            return (
              <div 
                key={repo.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl hover:border-[var(--koro-hairline-stronger)] transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] rounded-lg text-[var(--koro-on-primary)] shrink-0 mt-1">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-[var(--koro-on-primary)] tracking-wide">{repo.fullName}</h3>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] rounded text-[var(--koro-ash)]">
                        {repo.visibility === "private" ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        {repo.visibility}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium tracking-wide">
                      <div className="flex items-center gap-1.5">
                        {isSynced && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                        {isFailed && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                        {isSyncing && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                        {!repo.syncStatus && <Database className="w-3.5 h-3.5 text-[var(--koro-ash)]" />}
                        
                        <span className={
                          isSynced ? "text-green-500" :
                          isFailed ? "text-red-500" :
                          isSyncing ? "text-blue-500" : "text-[var(--koro-ash)]"
                        }>
                          {repo.syncStatus ? repo.syncStatus.charAt(0).toUpperCase() + repo.syncStatus.slice(1) : "Unsynced"}
                        </span>
                      </div>
                      {repo.defaultBranch && (
                        <>
                          <span className="text-[var(--koro-hairline-stronger)]">•</span>
                          <span className="text-[var(--koro-ash)]">Branch: {repo.defaultBranch}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <SyncRepoButton
                    repoFullName={repo.fullName}
                    branch={repo.defaultBranch}
                    syncStatus={repo.syncStatus}
                    isSyncLimitReached={isSyncLimitReached}
                  />
                </div>
              </div>
            );
          })
        )}

        <div ref={observerTarget} className="h-10 mt-2 flex items-center justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-[var(--koro-ash)] text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading more...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
