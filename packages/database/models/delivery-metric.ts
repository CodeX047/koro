import { pgTable, uuid, varchar, timestamp, integer, jsonb, index, text } from "drizzle-orm/pg-core";
import { organizationTable } from "./auth";
import { repositoriesTable } from "./github";
import { featuresTable } from "./feature";

export type DeliveryMetricType =
  | "LEAD_TIME"
  | "CYCLE_TIME"
  | "REVIEW_TIME"
  | "MERGE_TIME"
  | "TASK_COMPLETION_TIME"
  | "FEATURE_COMPLETION_TIME"
  | "AI_REVIEW_DURATION"
  | "RELEASE_DURATION";

export const deliveryMetricsTable = pgTable(
  "delivery_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .references(() => organizationTable.id, { onDelete: "cascade" })
      .notNull(),
    repositoryId: uuid("repository_id").references(() => repositoriesTable.id, {
      onDelete: "set null",
    }),
    featureId: uuid("feature_id").references(() => featuresTable.id, { onDelete: "cascade" }),
    developerId: varchar("developer_id", { length: 255 }),
    metricType: varchar("metric_type", { length: 50 }).$type<DeliveryMetricType>().notNull(),
    metricValue: integer("metric_value").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  },
  (t) => [
    index("delivery_metrics_organization_id_idx").on(t.organizationId),
    index("delivery_metrics_feature_id_idx").on(t.featureId),
    index("delivery_metrics_developer_id_idx").on(t.developerId),
    index("delivery_metrics_metric_type_idx").on(t.metricType),
    index("delivery_metrics_calculated_at_idx").on(t.calculatedAt),
  ],
);
