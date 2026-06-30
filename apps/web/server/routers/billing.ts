import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { db, eq } from "@repo/database";
import { billingsTable } from "@repo/database/schema";

export const billingRouter = router({
  getSubscription: protectedProcedure
    .query(async ({ ctx }) => {
      const orgId = ctx.activeOrganizationId;
      if (!orgId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization selected" });
      }
      console.log(`Getting subscription status for org ${orgId}`);
      
      let [billing] = await db.select().from(billingsTable).where(eq(billingsTable.organizationId, orgId));
      if (!billing) {
        const result = await db.insert(billingsTable).values({
          organizationId: orgId,
          plan: "free",
          status: "active",
        }).returning();
        billing = result[0];
      }
      
      if (!billing) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create billing record" });
      }
      
      return {
        plan: billing.plan,
        status: billing.status,
        reviewsUsed: 5,
        reviewsLimit: 20
      };
    }),
});
