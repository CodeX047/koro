import { db } from "@repo/database";
import { usageTable } from "@repo/database/schema";
import { eq, and } from "drizzle-orm";
import { canRunAIReview } from "../billing/access";

// Usage Enforcement logic implementing a reservation pattern
// Reserve Credit -> Run AI -> Commit Usage (or Release Reservation on fail)

// In a real high-throughput scenario, this might use Redis for atomic operations
// Here we use the database

export async function reserveAICredit(organizationId: string): Promise<boolean> {
  const canRun = await canRunAIReview(organizationId);
  if (!canRun) return false;

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  // Upsert usage record
  const existing = await db.select().from(usageTable).where(
    and(eq(usageTable.organizationId, organizationId), eq(usageTable.month, currentMonth))
  ).limit(1);

  if (existing.length === 0) {
    await db.insert(usageTable).values({
      organizationId,
      month: currentMonth,
      aiReviewsUsed: 1, // Reserved
      repositoriesUsed: 0,
    });
  } else if (existing[0]) {
    // Increment usage to reserve
    await db.update(usageTable)
      .set({ aiReviewsUsed: existing[0].aiReviewsUsed + 1 })
      .where(eq(usageTable.id, existing[0].id));
  }
  return true;
}

export async function releaseAICreditReservation(organizationId: string): Promise<void> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const existing = await db.select().from(usageTable).where(
    and(eq(usageTable.organizationId, organizationId), eq(usageTable.month, currentMonth))
  ).limit(1);

  if (existing.length > 0 && existing[0] && existing[0].aiReviewsUsed > 0) {
    // Decrement
    await db.update(usageTable)
      .set({ aiReviewsUsed: existing[0].aiReviewsUsed - 1 })
      .where(eq(usageTable.id, existing[0].id));
  }
}

// Commit is a no-op here since reservation already incremented the counter.
export async function commitAICredit(organizationId: string): Promise<void> {
  // Usage is already recorded by reserveAICredit
}
