import React from "react";
import Link from "next/link";
import { requireAuth } from "~/features/auth/utils/auth";
import { db, eq, and, desc, inArray, count } from "@repo/database";
import {
  projectsTable,
  featuresTable,
  reviewsTable,
  githubInstallationsTable,
  repoSyncTable,
  usageTable,
  prdsTable,
} from "@repo/database/schema";
import { getActivePlan } from "@repo/services/billing/access";
import { CreateOrgCard } from "./_components/create-org-card";

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const orgId = session.session.activeOrganizationId;

  if (!orgId) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8 font-sans">
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
          .select({ projectId: reviewsTable.projectId, count: count() })
          .from(reviewsTable)
          .where(inArray(reviewsTable.projectId, projectIds))
          .groupBy(reviewsTable.projectId)
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
          .select()
          .from(reviewsTable)
          .where(inArray(reviewsTable.projectId, projectIds))
          .orderBy(desc(reviewsTable.createdAt))
          .limit(3)
      : Promise.resolve([]),
    projectIds.length > 0
      ? db
          .select({ status: reviewsTable.status })
          .from(reviewsTable)
          .where(inArray(reviewsTable.projectId, projectIds))
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
    const passingCount = (allReviews as any[]).filter((r) => r.status !== "pending").length;
    readinessScore = Math.round((passingCount / (allReviews as any[]).length) * 100);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Overview Stats */}
      <div>
        <div
          className="text-[12px] font-bold mb-4 flex items-center justify-between uppercase tracking-wider"
          style={{ color: "var(--koro-on-primary)" }}
        >
          <span>Overview</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="p-4 rounded-sm flex flex-col gap-3 relative overflow-hidden"
            style={{ border: "1px solid var(--koro-hairline-strong)" }}
          >
            <div
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--koro-ash)" }}
            >
              AI Usage
            </div>
            <div className="text-[28px] font-bold">
              {reviewsUsed}{" "}
              <span className="text-[16px] text-[var(--koro-ash)] font-normal">
                / {reviewsLimit}
              </span>
            </div>
            <div className="text-[11px]" style={{ color: "var(--koro-ash)" }}>
              Reset in {daysRemaining} days
            </div>
          </div>

          <div
            className="p-4 rounded-sm flex flex-col gap-3 relative overflow-hidden"
            style={{ border: "1px solid var(--koro-hairline-strong)" }}
          >
            <div
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--koro-ash)" }}
            >
              GitHub Status
            </div>
            {isGithubConnected ? (
              <>
                <div
                  className="text-[20px] font-bold flex items-center gap-2 h-[42px]"
                  style={{ color: "var(--koro-success)" }}
                >
                  <span className="text-[12px] koro-animate-pulse">●</span> Connected
                </div>
                <div
                  className="text-[11px] font-mono truncate"
                  style={{ color: "var(--koro-ash)" }}
                >
                  {syncedRepo
                    ? `Syncing: ${syncedRepo.repoFullName}`
                    : `Account: ${githubConnection[0]?.accountLogin}`}
                </div>
              </>
            ) : (
              <>
                <div
                  className="text-[20px] font-bold flex items-center gap-2 h-[42px]"
                  style={{ color: "var(--koro-ash)" }}
                >
                  <span className="text-[12px]">●</span> Disconnected
                </div>
                <div className="text-[11px]" style={{ color: "var(--koro-ash)" }}>
                  Connect GitHub in settings
                </div>
              </>
            )}
          </div>

          <div
            className="p-4 rounded-sm flex flex-col gap-3 relative overflow-hidden"
            style={{ border: "1px solid var(--koro-hairline-strong)" }}
          >
            <div
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--koro-ash)" }}
            >
              Readiness Score
            </div>
            <div className="text-[28px] font-bold" style={{ color: "var(--koro-accent)" }}>
              {readinessScore}%
            </div>
            <div className="text-[11px]" style={{ color: "var(--koro-ash)" }}>
              Target standard: 90%
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div>
        <div className="text-[12px] font-bold mb-4 flex items-center justify-between uppercase tracking-wider">
          <span>Active Projects</span>
          <Link
            href="/dashboard/projects"
            className="text-[var(--koro-accent)] hover:text-[var(--koro-on-primary)] transition-colors lowercase tracking-normal"
          >
            [+] new project
          </Link>
        </div>
        {projectsWithCounts.length === 0 ? (
          <div
            className="p-6 text-center border border-dashed rounded-sm"
            style={{ borderColor: "var(--koro-hairline-strong)" }}
          >
            <p className="text-[12px]" style={{ color: "var(--koro-ash)" }}>
              No active projects found. Get started by creating one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectsWithCounts.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-sm flex flex-col gap-3 cursor-pointer group transition-colors"
                style={{
                  border: "1px solid var(--koro-hairline-strong)",
                  backgroundColor: "var(--koro-surface-dark)",
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="text-[14px] font-bold group-hover:text-[var(--koro-accent)] transition-colors">
                    {project.name}
                  </div>
                  <div
                    className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wide"
                    style={{
                      backgroundColor: "var(--koro-surface-dark-elevated)",
                      color: "var(--koro-success)",
                    }}
                  >
                    ACTIVE
                  </div>
                </div>
                <div className="text-[12px] leading-relaxed" style={{ color: "var(--koro-ash)" }}>
                  {project.featureCount} features defined • {project.reviewCount} code reviews
                  conducted
                </div>
                <div
                  className="text-[10px] mt-2"
                  style={{ color: "var(--koro-ash)", opacity: 0.7 }}
                >
                  Created on {new Date(project.createdAt || "").toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity / Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="text-[12px] font-bold mb-4 flex items-center justify-between uppercase tracking-wider">
            <span>Recent Features</span>
          </div>
          {featuresWithPrd.length === 0 ? (
            <div
              className="p-6 text-center border border-dashed rounded-sm"
              style={{ borderColor: "var(--koro-hairline-strong)" }}
            >
              <p className="text-[12px]" style={{ color: "var(--koro-ash)" }}>
                No features defined yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {featuresWithPrd.map((feature) => (
                <div
                  key={feature.id}
                  className="p-4 rounded-sm flex flex-col gap-2"
                  style={{ border: "1px solid var(--koro-hairline-strong)" }}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-[13px] font-bold">{feature.title}</div>
                    <div
                      className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wide mt-0.5"
                      style={{
                        backgroundColor: "var(--koro-surface-dark-elevated)",
                        color: "var(--koro-accent)",
                      }}
                    >
                      {feature.status}
                    </div>
                  </div>
                  {feature.description && (
                    <div className="text-[12px] line-clamp-2" style={{ color: "var(--koro-ash)" }}>
                      {feature.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-[12px] font-bold mb-4 flex items-center justify-between uppercase tracking-wider">
            <span>Recent Reviews</span>
          </div>
          {recentReviews.length === 0 ? (
            <div
              className="p-6 text-center border border-dashed rounded-sm"
              style={{ borderColor: "var(--koro-hairline-strong)" }}
            >
              <p className="text-[12px]" style={{ color: "var(--koro-ash)" }}>
                No reviews completed yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentReviews.map((review) => {
                const verdict = review.status === "pending" ? "FIX_REQUIRED" : "PASS";
                const score = review.status === "pending" ? 85 : 95;
                const isPass = verdict === "PASS";
                return (
                  <div
                    key={review.id}
                    className="p-4 rounded-sm flex flex-col gap-2"
                    style={{ border: "1px solid var(--koro-hairline-strong)" }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-[13px] font-bold pr-4">{review.title}</div>
                      <div
                        className="text-[11px] font-mono font-bold mt-0.5"
                        style={{ color: isPass ? "var(--koro-success)" : "#ff4444" }}
                      >
                        {score}%
                      </div>
                    </div>
                    <div className="text-[12px]" style={{ color: "var(--koro-ash)" }}>
                      Verdict:{" "}
                      <span
                        className="font-semibold"
                        style={{ color: isPass ? "var(--koro-success)" : "#ff4444" }}
                      >
                        {verdict}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
