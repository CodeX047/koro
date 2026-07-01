import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { featuresTable } from "./feature";

export type FeatureEventType =
  | "feature_created"
  | "clarification_requested"
  | "clarification_completed"
  | "prd_generation_started"
  | "prd_generated"
  | "tasks_generated"
  | "failed";

export const featureEventsTable = pgTable("feature_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  featureId: uuid("feature_id")
    .references(() => featuresTable.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 100 })
    .$type<FeatureEventType>()
    .notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
