import { db, eq } from "@repo/database";
import {
  featuresTable,
  type FeatureStatus,
} from "@repo/database/schema";
import { featureEventsTable, type FeatureEventType } from "@repo/database/schema";

// ─── Feature Repository ───────────────────────────────────────────────

export async function createFeature(input: {
  title: string;
  description: string;
  projectId: string;
}) {
  const [feature] = await db
    .insert(featuresTable)
    .values({ ...input, status: "DRAFT" })
    .returning();

  if (!feature) throw new Error("Failed to create feature");

  await logFeatureEvent(feature.id, "feature_created", {
    title: input.title,
    projectId: input.projectId,
  });

  return feature;
}

export async function getFeatureById(featureId: string) {
  const [feature] = await db
    .select()
    .from(featuresTable)
    .where(eq(featuresTable.id, featureId));

  return feature ?? null;
}

export async function getFeaturesByProjectId(projectId: string) {
  return db
    .select()
    .from(featuresTable)
    .where(eq(featuresTable.projectId, projectId))
    .orderBy(featuresTable.createdAt);
}

export async function updateFeatureStatus(
  featureId: string,
  status: FeatureStatus,
  eventMetadata?: Record<string, unknown>,
) {
  const [updated] = await db
    .update(featuresTable)
    .set({ status })
    .where(eq(featuresTable.id, featureId))
    .returning();

  if (!updated) throw new Error(`Feature ${featureId} not found`);

  return updated;
}

// ─── Feature Event Log ────────────────────────────────────────────────

export async function logFeatureEvent(
  featureId: string,
  type: FeatureEventType,
  metadata: Record<string, unknown> = {},
) {
  const [event] = await db
    .insert(featureEventsTable)
    .values({ featureId, type, metadata })
    .returning();

  return event;
}
