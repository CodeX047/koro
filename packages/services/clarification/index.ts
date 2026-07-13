import { db, eq, and } from "@repo/database";
import { clarificationsTable, type ClarificationStatus } from "@repo/database/schema";

// ─── Clarification Repository ──────────────────────────────────────────

export async function saveClarificationQuestions(featureId: string, questions: string[]) {
  if (questions.length === 0) return [];

  const rows = questions.map((question, i) => ({
    featureId,
    question,
    order: i,
    status: "PENDING" as ClarificationStatus,
    createdBy: "ai",
  }));

  return db.insert(clarificationsTable).values(rows).returning();
}

export async function getClarificationsByFeatureId(featureId: string) {
  return db
    .select()
    .from(clarificationsTable)
    .where(eq(clarificationsTable.featureId, featureId))
    .orderBy(clarificationsTable.order);
}

export async function getPendingClarifications(featureId: string) {
  return db
    .select()
    .from(clarificationsTable)
    .where(
      and(eq(clarificationsTable.featureId, featureId), eq(clarificationsTable.status, "PENDING")),
    );
}

export async function submitAnswer(clarificationId: string, answer: string) {
  const [updated] = await db
    .update(clarificationsTable)
    .set({
      answer,
      status: "ANSWERED",
      answeredAt: new Date(),
    })
    .where(eq(clarificationsTable.id, clarificationId))
    .returning();

  return updated;
}

export async function skipClarification(clarificationId: string) {
  const [updated] = await db
    .update(clarificationsTable)
    .set({ status: "SKIPPED" })
    .where(eq(clarificationsTable.id, clarificationId))
    .returning();

  return updated;
}

export async function allClarificationsResolved(featureId: string) {
  const pending = await getPendingClarifications(featureId);
  return pending.length === 0;
}
