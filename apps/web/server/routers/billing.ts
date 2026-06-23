import { protectedProcedure, router } from "../trpc";

export const billingRouter = router({
  getSubscription: protectedProcedure
    .query(async ({ ctx }) => {
      const orgId = ctx.activeOrganizationId;
      console.log(`Getting subscription status for org ${orgId}`);
      return {
        plan: "free",
        status: "active",
        reviewsUsed: 5,
        reviewsLimit: 20
      };
    }),
});
