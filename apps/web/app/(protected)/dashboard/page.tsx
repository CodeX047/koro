import React from "react";
import Link from "next/link";
import { requireAuth } from "~/features/auth/utils/auth";
import { db, eq, and, desc, inArray, count } from "@repo/database";
import {
  projectsTable,
  featuresTable,
  githubInstallationsTable,
  repoSyncTable,
  usageTable,
  reviewRunsTable,
  pullRequestsTable,
  repositoriesTable,
} from "@repo/database/schema";
import { getActivePlan } from "@repo/services/billing/access";
import { CreateOrgCard } from "./_components/create-org-card";
import {
  Activity,
  BarChart3,
  Github,
  Target,
  FolderKanban,
  Plus,
  FileCheck,
  GitPullRequest,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await requireAuth();

  const userId = session.user.id;
  const orgId = session.session.activeOrganizationId;

  if (!orgId) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 font-sans">
        <CreateOrgCard />
      </div>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [githubConnection, usageResult, projects] = await Promise.all([
    db
      .select()
      .from(githubInstallationsTable)
      .where(eq(githubInstallationsTable.userId, userId))
      .limit(1),
    db
      .select()
      .from(usageTable)
      .where(and(eq(usageTable.organizationId, orgId), eq(usageTable.month, currentMonth)))
      .limit(1),
    db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.organizationId, orgId))
      .orderBy(desc(projectsTable.createdAt))
      .limit(4),
  ]);

  const isGithubConnected = githubConnection.length > 0;
  const installationId = githubConnection[0]?.installationId;

  const projectIds = projects.map((p) => p.id);

  const [
    syncedRepoResult,
    plan,
    featureCountsRaw,
    reviewCountsRaw,
    recentFeatures,
    recentReviews,
    allReviews,
  ] = await Promise.all([
    isGithubConnected && installationId
      ? db
          .select()
          .from(repoSyncTable)
          .where(eq(repoSyncTable.installationId, installationId))
          .limit(1)
      : Promise.resolve([]),
    getActivePlan(orgId),
    projectIds.length > 0
      ? db
          .select({ projectId: featuresTable.projectId, count: count() })
          .from(featuresTable)
          .where(inArray(featuresTable.projectId, projectIds))
          .groupBy(featuresTable.projectId)
      : Promise.resolve([]),
    projectIds.length > 0
      ? db
          .select({ projectId: repositoriesTable.projectId, count: count() })
          .from(reviewRunsTable)
          .innerJoin(pullRequestsTable, eq(reviewRunsTable.prId, pullRequestsTable.id))
          .innerJoin(repositoriesTable, eq(pullRequestsTable.repositoryId, repositoriesTable.id))
          .where(inArray(repositoriesTable.projectId, projectIds))
          .groupBy(repositoriesTable.projectId)
      : Promise.resolve([]),
    projectIds.length > 0
      ? db
          .select()
          .from(featuresTable)
          .where(inArray(featuresTable.projectId, projectIds))
          .orderBy(desc(featuresTable.createdAt))
          .limit(3)
      : Promise.resolve([]),
    projectIds.length > 0
      ? db
          .select({
            id: reviewRunsTable.id,
            title: pullRequestsTable.title,
            verdict: reviewRunsTable.verdict,
            score: reviewRunsTable.score,
            createdAt: reviewRunsTable.createdAt,
            projectId: repositoriesTable.projectId,
          })
          .from(reviewRunsTable)
          .innerJoin(pullRequestsTable, eq(reviewRunsTable.prId, pullRequestsTable.id))
          .innerJoin(repositoriesTable, eq(pullRequestsTable.repositoryId, repositoriesTable.id))
          .where(inArray(repositoriesTable.projectId, projectIds))
          .orderBy(desc(reviewRunsTable.createdAt))
          .limit(3)
      : Promise.resolve([]),
    projectIds.length > 0
      ? db
          .select({ verdict: reviewRunsTable.verdict })
          .from(reviewRunsTable)
          .innerJoin(pullRequestsTable, eq(reviewRunsTable.prId, pullRequestsTable.id))
          .innerJoin(repositoriesTable, eq(pullRequestsTable.repositoryId, repositoriesTable.id))
          .where(inArray(repositoriesTable.projectId, projectIds))
      : Promise.resolve([]),
  ]);

  const syncedRepo = (syncedRepoResult as any[])[0] ?? null;
  const reviewsUsed = usageResult[0]?.aiReviewsUsed || 0;
  const reviewsLimit = plan.aiReviewsAllowance;

  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = endOfMonth.getDate() - today.getDate();

  const featureCountMap = new Map(
    (featureCountsRaw as any[]).map((r) => [r.projectId, Number(r.count)]),
  );
  const reviewCountMap = new Map(
    (reviewCountsRaw as any[]).map((r) => [r.projectId, Number(r.count)]),
  );

  const projectsWithCounts = projects.map((p) => ({
    ...p,
    featureCount: featureCountMap.get(p.id) ?? 0,
    reviewCount: reviewCountMap.get(p.id) ?? 0,
  }));

  const featuresWithPrd = recentFeatures as (typeof featuresTable.$inferSelect & {
    status: string;
  })[];

  let readinessScore = 100;
  if ((allReviews as any[]).length > 0) {
    const passingCount = (allReviews as any[]).filter((r) => r.verdict === "APPROVE").length;
    readinessScore = Math.round((passingCount / (allReviews as any[]).length) * 100);
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-12">
      {/* Overview Stats */}
      <section>
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-[var(--koro-on-primary)]">
          <Activity className="w-5 h-5 text-[var(--koro-accent)]" />
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--koro-accent)]/5 rounded-full blur-2xl group-hover:bg-[var(--koro-accent)]/10 transition-colors pointer-events-none" />
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--koro-accent)]" />
              AI Usage
            </div>
            <div className="text-3xl font-semibold text-[var(--koro-on-primary)] tracking-tight">
              {reviewsUsed}{" "}
              <span className="text-lg text-[var(--koro-ash)] font-normal tracking-normal">
                / {reviewsLimit}
              </span>
            </div>
            <div className="text-sm text-[var(--koro-ash)] opacity-80 mt-auto">
              Reset in {daysRemaining} days
            </div>
          </div>

          <div className="p-6 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--koro-accent)]/5 rounded-full blur-2xl group-hover:bg-[var(--koro-accent)]/10 transition-colors pointer-events-none" />
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex items-center gap-2">
              <Github className="w-4 h-4 text-[var(--koro-accent)]" />
              GitHub Status
            </div>
            {isGithubConnected ? (
              <>
                <div className="text-xl font-semibold text-green-500 flex items-center gap-2 h-[36px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  Connected
                </div>
                <div className="text-sm text-[var(--koro-ash)] truncate mt-auto">
                  {syncedRepo
                    ? `Syncing: ${syncedRepo.repoFullName}`
                    : `Account: ${githubConnection[0]?.accountLogin}`}
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-semibold text-[var(--koro-ash)] flex items-center gap-2 h-[36px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--koro-ash)]" />
                  Disconnected
                </div>
                <Link
                  href="/dashboard/github"
                  className="text-sm text-[var(--koro-accent)] hover:underline mt-auto"
                >
                  Connect GitHub in settings →
                </Link>
              </>
            )}
          </div>

          <div className="p-6 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--koro-accent)]/5 rounded-full blur-2xl group-hover:bg-[var(--koro-accent)]/10 transition-colors pointer-events-none" />
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--koro-ash)] flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--koro-accent)]" />
              Readiness Score
            </div>
            <div className="text-3xl font-semibold text-[var(--koro-accent)] tracking-tight">
              {readinessScore}%
            </div>
            <div className="text-sm text-[var(--koro-ash)] opacity-80 mt-auto">
              Target standard: 90%
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--koro-on-primary)]">
            <FolderKanban className="w-5 h-5 text-[var(--koro-accent)]" />
            Active Projects
          </h2>
          <Link
            href="/dashboard/projects"
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--koro-accent)] hover:text-[var(--koro-on-primary)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
        {projectsWithCounts.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[var(--koro-hairline-strong)] rounded-xl bg-[var(--koro-surface-dark-elevated)]">
            <FolderKanban className="w-10 h-10 mx-auto mb-3 text-[var(--koro-ash)] opacity-50" />
            <p className="text-[var(--koro-ash)] text-sm">
              No active projects found. Get started by creating one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projectsWithCounts.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}/settings`}
                className="p-5 flex flex-col gap-4 group transition-all cursor-pointer bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl hover:border-[var(--koro-hairline-stronger)] shadow-sm block"
              >
                <div className="flex justify-between items-start">
                  <div className="text-base font-semibold text-[var(--koro-on-primary)] group-hover:text-[var(--koro-accent)] transition-colors pr-4">
                    {project.name}
                  </div>
                  <div className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase bg-green-500/10 text-green-500 border border-green-500/20 shrink-0">
                    ACTIVE
                  </div>
                </div>
                <div className="text-sm leading-relaxed text-[var(--koro-ash)]">
                  {project.featureCount} features defined • {project.reviewCount} code reviews
                  conducted
                </div>
                <div className="text-xs mt-1 text-[var(--koro-ash)] opacity-70">
                  Created on{" "}
                  {new Date(project.createdAt || "").toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Activity / Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--koro-on-primary)]">
              <FileCheck className="w-5 h-5 text-[var(--koro-accent)]" />
              Recent Features
            </h2>
            <Link
              href="/dashboard/features"
              className="text-sm font-medium text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)] transition-colors flex items-center gap-1 group"
            >
              View all{" "}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {featuresWithPrd.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-[var(--koro-hairline-strong)] rounded-xl bg-[var(--koro-surface-dark-elevated)]">
              <p className="text-sm text-[var(--koro-ash)]">No features defined yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {featuresWithPrd.map((feature) => (
                <div
                  key={feature.id}
                  className="p-5 bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-sm font-semibold text-[var(--koro-on-primary)]">
                      {feature.title}
                    </div>
                    <div className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase bg-[var(--koro-surface-dark-elevated)] text-[var(--koro-accent)] border border-[var(--koro-hairline-strong)] shrink-0">
                      {feature.status.replace(/_/g, " ")}
                    </div>
                  </div>
                  {feature.description && (
                    <div className="text-sm line-clamp-2 text-[var(--koro-ash)] leading-relaxed">
                      {feature.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--koro-on-primary)]">
              <GitPullRequest className="w-5 h-5 text-[var(--koro-accent)]" />
              Recent Reviews
            </h2>
          </div>
          {recentReviews.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-[var(--koro-hairline-strong)] rounded-xl bg-[var(--koro-surface-dark-elevated)]">
              <p className="text-sm text-[var(--koro-ash)]">No reviews completed yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recentReviews.map((review: any) => {
                const verdict = review.verdict === "APPROVE" ? "PASS" : "FIX_REQUIRED";
                const score = review.score ?? 0;
                const isPass = verdict === "PASS";
                return (
                  <div
                    key={review.id}
                    className="p-5 bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] rounded-xl flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-sm font-semibold text-[var(--koro-on-primary)]">
                        {review.title}
                      </div>
                      <div
                        className="text-sm font-mono font-bold mt-0.5"
                        style={{ color: isPass ? "var(--koro-success)" : "#ff4444" }}
                      >
                        {score}%
                      </div>
                    </div>
                    <div className="text-sm text-[var(--koro-ash)] flex items-center gap-2">
                      Verdict:{" "}
                      <span
                        className="font-semibold text-[10px] px-2 py-0.5 rounded-full tracking-widest uppercase border"
                        style={{
                          color: isPass ? "var(--koro-success)" : "#ff4444",
                          backgroundColor: isPass
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                          borderColor: isPass ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        {verdict}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
