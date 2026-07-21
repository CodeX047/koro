import { asc, db, eq } from "@repo/database";
import {
  developmentEventsTable,
  featuresTable,
  prdsTable,
  releaseRunsTable,
  reviewRunsTable,
  pullRequestsTable,
} from "@repo/database/schema";

export type DeliveryTimelineItem = {
  type: string;
  title: string;
  description: string;
  actor: string | null;
  timestamp: Date;
  icon: string;
  color: "slate" | "blue" | "indigo" | "yellow" | "emerald" | "red" | "purple";
  metadata: Record<string, unknown>;
};

const EVENT_MAP: Record<string, Pick<DeliveryTimelineItem, "type" | "title" | "icon" | "color">> = {
  "Issue Created": {
    type: "ISSUE_CREATED",
    title: "Issue Created",
    icon: "issue",
    color: "emerald",
  },
  "Issue Assigned": {
    type: "ISSUE_ASSIGNED",
    title: "Issue Assigned",
    icon: "user",
    color: "blue",
  },
  "Branch Created": {
    type: "BRANCH_CREATED",
    title: "Branch Created",
    icon: "branch",
    color: "indigo",
  },
  "PR Opened": {
    type: "PR_OPENED",
    title: "Pull Request Opened",
    icon: "pull-request",
    color: "emerald",
  },
  "Commits Pushed": {
    type: "COMMITS_PUSHED",
    title: "Commits Pushed",
    icon: "commit",
    color: "slate",
  },
  "PR Merged": {
    type: "PR_MERGED",
    title: "Pull Request Merged",
    icon: "merge",
    color: "purple",
  },
  "PR Review Approved": {
    type: "AI_REVIEW_APPROVED",
    title: "Review Approved",
    icon: "review",
    color: "emerald",
  },
  "PR Review Changes Requested": {
    type: "AI_REVIEW_FAILED",
    title: "Changes Requested",
    icon: "review",
    color: "red",
  },
};

function eventDescription(event: typeof developmentEventsTable.$inferSelect) {
  const metadata = (event.metadata ?? {}) as Record<string, unknown>;
  const title = typeof metadata.title === "string" ? metadata.title : null;
  const count = typeof metadata.commitCount === "number" ? metadata.commitCount : null;
  if (event.eventType === "Commits Pushed" && count !== null) return `${count} commit(s) pushed.`;
  if (event.resourceType === "pull_request") return title ?? `Pull request #${event.resourceId}`;
  if (event.resourceType === "issue") return title ?? `Issue #${event.resourceId}`;
  return title ?? event.eventType;
}

export async function getFeatureTimeline(featureId: string): Promise<DeliveryTimelineItem[]> {
  const [feature] = await db.select().from(featuresTable).where(eq(featuresTable.id, featureId));
  if (!feature) return [];

  const [prd] = await db.select().from(prdsTable).where(eq(prdsTable.featureId, featureId));
  const events = await db
    .select()
    .from(developmentEventsTable)
    .where(eq(developmentEventsTable.featureId, featureId))
    .orderBy(asc(developmentEventsTable.createdAt));
  const prs = await db
    .select()
    .from(pullRequestsTable)
    .where(eq(pullRequestsTable.featureId, featureId));
  const releases = await db
    .select()
    .from(releaseRunsTable)
    .where(eq(releaseRunsTable.featureId, featureId))
    .orderBy(asc(releaseRunsTable.createdAt));

  const timeline: DeliveryTimelineItem[] = [
    {
      type: "FEATURE_CREATED",
      title: "Feature Created",
      description: feature.description ?? feature.title,
      actor: null,
      timestamp: feature.createdAt ?? new Date(),
      icon: "feature",
      color: "blue",
      metadata: { featureId: feature.id },
    },
  ];

  if (prd?.createdAt) {
    timeline.push({
      type: "PRD_GENERATED",
      title: "PRD Generated",
      description: "Product requirements were generated.",
      actor: null,
      timestamp: prd.createdAt,
      icon: "document",
      color: "indigo",
      metadata: { prdId: prd.id },
    });
  }

  for (const event of events) {
    const mapped = EVENT_MAP[event.eventType] ?? {
      type: event.eventType.toUpperCase().replaceAll(" ", "_"),
      title: event.eventType,
      icon: "event",
      color: "slate" as const,
    };

    timeline.push({
      ...mapped,
      description: eventDescription(event),
      actor: event.actor,
      timestamp: event.createdAt,
      metadata: {
        id: event.id,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        ...((event.metadata ?? {}) as Record<string, unknown>),
      },
    });
  }

  for (const pr of prs) {
    if (pr.reviewStatus === "RUNNING") {
      timeline.push({
        type: "AI_REVIEW_STARTED",
        title: "AI Review Started",
        description: pr.title,
        actor: "Koro AI",
        timestamp: pr.updatedAt,
        icon: "review",
        color: "yellow",
        metadata: { prId: pr.id, prNumber: pr.prNumber },
      });
    }

    if (pr.reviewedAt) {
      const [latestRun] = await db
        .select()
        .from(reviewRunsTable)
        .where(eq(reviewRunsTable.prId, pr.id))
        .orderBy(asc(reviewRunsTable.createdAt));

      timeline.push({
        type: latestRun?.verdict === "APPROVE" ? "AI_REVIEW_APPROVED" : "AI_REVIEW_FAILED",
        title: latestRun?.verdict === "APPROVE" ? "AI Review Approved" : "AI Review Completed",
        description: pr.reviewComment ?? pr.title,
        actor: "Koro AI",
        timestamp: pr.reviewedAt,
        icon: "review",
        color: latestRun?.verdict === "APPROVE" ? "emerald" : "yellow",
        metadata: { prId: pr.id, prNumber: pr.prNumber, verdict: latestRun?.verdict },
      });
    }
  }

  for (const release of releases) {
    timeline.push({
      type: release.verdict === "READY" ? "RELEASE_READY" : "RELEASE_EVALUATED",
      title: release.verdict === "READY" ? "Release Ready" : "Release Evaluated",
      description: release.summary ?? `Release score: ${release.overallScore ?? 0}`,
      actor: release.triggeredBy,
      timestamp: release.createdAt,
      icon: "release",
      color: release.verdict === "READY" ? "emerald" : "yellow",
      metadata: { releaseRunId: release.id, score: release.overallScore, verdict: release.verdict },
    });
  }

  if (feature.status === "RELEASED" && feature.updatedAt) {
    timeline.push({
      type: "FEATURE_RELEASED",
      title: "Feature Released",
      description: "Feature marked as released.",
      actor: null,
      timestamp: feature.updatedAt,
      icon: "release",
      color: "emerald",
      metadata: { featureId: feature.id },
    });
  }

  return timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
