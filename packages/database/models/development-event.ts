import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { featuresTable } from "./feature";

export const developmentEventsTable = pgTable("development_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  featureId: uuid("feature_id").references(() => featuresTable.id, { onDelete: "cascade" }).notNull(),
  eventType: varchar("event_type", { length: 255 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
