import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { featuresTable } from "./feature";

export const developmentEventsTable = pgTable(
  "development_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    featureId: uuid("feature_id")
      .references(() => featuresTable.id, { onDelete: "cascade" })
      .notNull(),
    eventType: varchar("event_type", { length: 255 }).notNull(),
    githubEventId: varchar("github_event_id", { length: 255 }),
    actor: varchar("actor", { length: 255 }),
    resourceType: varchar("resource_type", { length: 50 }), // issue, pull_request, commit, branch, review
    resourceId: varchar("resource_id", { length: 255 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("dev_events_feature_id_idx").on(t.featureId),
    index("dev_events_github_event_id_idx").on(t.githubEventId),
  ],
);
