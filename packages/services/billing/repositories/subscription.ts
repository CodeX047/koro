import { db } from "@repo/database";
import { subscriptionTable } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import type { PlanId } from "@repo/config";

export async function getSubscriptionByOrgId(organizationId: string) {
  const result = await db
    .select()
    .from(subscriptionTable)
    .where(eq(subscriptionTable.organizationId, organizationId))
    .limit(1);
  return result[0] || null;
}

export async function updateSubscription(
  subscriptionId: string,
  data: Partial<typeof subscriptionTable.$inferInsert>,
) {
  return db
    .update(subscriptionTable)
    .set(data)
    .where(eq(subscriptionTable.subscriptionId, subscriptionId))
    .returning();
}

export async function createSubscription(data: typeof subscriptionTable.$inferInsert) {
  return db.insert(subscriptionTable).values(data).returning();
}
