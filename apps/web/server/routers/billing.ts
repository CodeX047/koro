import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getActivePlan } from "@repo/services/billing/access";
import { db, eq, and } from "@repo/database";
import { usageTable } from "@repo/database/schema";
import { createCheckoutSession } from "@repo/services/billing/checkout";
import { getCustomerPortalUrl } from "@repo/services/billing/customer";

export const billingRouter = router({
  getSubscription: protectedProcedure
    .query(async ({ ctx }) => {
      const orgId = ctx.activeOrganizationId;
      if (!orgId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization selected" });
      }
      
      const plan = await getActivePlan(orgId);
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usageResult = await db.select().from(usageTable).where(
        and(eq(usageTable.organizationId, orgId), eq(usageTable.month, currentMonth))
      ).limit(1);
      
      const usage = usageResult[0];

      return {
        plan: plan.id,
        status: "active", // Subscription status usually derived from DB but simplifying
        reviewsUsed: usage?.aiReviewsUsed || 0,
        reviewsLimit: plan.aiReviewsAllowance,
        repositoriesUsed: usage?.repositoriesUsed || 0,
        repositoriesLimit: plan.repositoriesAllowance,
      };
    }),
    
  createCheckoutSession: protectedProcedure
    .input(z.object({
      planId: z.string(),
      returnUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No active organization",
        });
      }

      const checkoutUrl = await createCheckoutSession({
        organizationId,
        planId: input.planId,
        email: ctx.user.email,
        returnUrl: input.returnUrl,
      });

      return { checkoutUrl };
    }),

  getCustomerPortalUrl: protectedProcedure
    .input(z.object({
      customerId: z.string(),
      returnUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No active organization",
        });
      }

      const url = await getCustomerPortalUrl({
        customerId: input.customerId,
        returnUrl: input.returnUrl,
      });

      return { url };
    }),
});
