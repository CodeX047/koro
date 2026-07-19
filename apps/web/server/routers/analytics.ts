import { z } from "zod";
import { featureProcedure, organizationProcedure, router } from "../trpc";
import {
  getAnalyticsDashboard,
  getDeveloperMetrics,
  getFeatureHealth,
  getFeatureMetrics,
  getFeatureTimeline,
  getOrganizationHealth,
  getOrganizationThroughput,
  getOrganizationVelocity,
} from "@repo/services/analytics";
import { DeliveryInsightsAgent } from "@repo/ai";
import { db, eq } from "@repo/database";
import { deliveryMetricsTable } from "@repo/database/schema";

export const analyticsRouter = router({
  timeline: featureProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getFeatureTimeline(input.featureId);
    }),

  featureMetrics: featureProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getFeatureMetrics(input.featureId);
    }),

  developerMetrics: organizationProcedure
    .input(z.object({ developerId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      return getDeveloperMetrics(ctx.activeOrganizationId, input.developerId);
    }),

  organizationMetrics: organizationProcedure.query(async ({ ctx }) => {
    const [velocity, throughput] = await Promise.all([
      getOrganizationVelocity(ctx.activeOrganizationId),
      getOrganizationThroughput(ctx.activeOrganizationId),
    ]);

    return { velocity, throughput };
  }),

  dashboard: organizationProcedure.query(async ({ ctx }) => {
    return getAnalyticsDashboard(ctx.activeOrganizationId);
  }),

  deliveryHealth: organizationProcedure
    .input(z.object({ featureId: z.string().uuid().optional() }).optional())
    .query(async ({ input, ctx }) => {
      if (input?.featureId) return getFeatureHealth(input.featureId);
      return getOrganizationHealth(ctx.activeOrganizationId);
    }),

  insights: organizationProcedure.query(async ({ ctx }) => {
    const dashboardData = await getAnalyticsDashboard(ctx.activeOrganizationId);
    const healthItems = dashboardData.health;
    const status = healthItems.some((h: any) => h.level === "critical") ? "critical" : healthItems.some((h: any) => h.level === "warning") ? "warning" : "healthy";
    
    const input = {
      averageLeadTimeMs: dashboardData.averageLeadTimeMs ?? 0,
      averageCycleTimeMs: dashboardData.averageCycleTimeMs ?? 0,
      averageAiReviewTimeMs: dashboardData.averageAiReviewTimeMs ?? 0,
      reviewSuccessRate: dashboardData.reviewSuccessRate ?? 0,
      featuresReleased: dashboardData.featuresReleased,
      featuresInProgress: dashboardData.featuresInProgress,
      openPrs: dashboardData.openPrs,
      blockedFeatures: dashboardData.blockedFeatures,
      velocity: dashboardData.velocity,
      throughput: dashboardData.throughput,
      health: {
        status: status as "healthy" | "warning" | "critical",
        issues: healthItems.map((h: any) => h.description)
      }
    };
    const agent = new DeliveryInsightsAgent();
    return agent.evaluate(input);
  }),

  listDevelopers: organizationProcedure.query(async ({ ctx }) => {
    const records = await db
      .select({ developerId: deliveryMetricsTable.developerId })
      .from(deliveryMetricsTable)
      .where(eq(deliveryMetricsTable.organizationId, ctx.activeOrganizationId));
    
    // Get unique non-null developer IDs
    const devIds = new Set(records.map(r => r.developerId).filter(Boolean));
    return Array.from(devIds) as string[];
  }),
});
