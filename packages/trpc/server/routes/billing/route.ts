import { router, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { createCheckoutSession } from "@repo/services/billing/checkout";
import { getCustomerPortalUrl } from "@repo/services/billing/customer";
import { TRPCError } from "@trpc/server";

export const billingRouter = router({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        returnUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.activeOrganizationId;
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
    .input(
      z.object({
        customerId: z.string(), // Wait, usually we look up customerId from subscription table using orgId
        returnUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.activeOrganizationId;
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
