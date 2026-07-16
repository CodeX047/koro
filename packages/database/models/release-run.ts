import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { featuresTable } from "./feature";
import { organizationTable } from "./auth";

export const releaseRunsTable = pgTable(
  "release_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    featureId: uuid("feature_id")
      .references(() => featuresTable.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: text("organization_id")
      .references(() => organizationTable.id, { onDelete: "cascade" })
      .notNull(),
    overallScore: integer("overall_score"),
    scoreBreakdown: jsonb("score_breakdown").$type<{
      requirements: number;
      reviewHealth: number;
      tasks: number;
      github: number;
      risk: number;
    }>(),
    verdict: varchar("verdict", { length: 50 }), // READY, NOT_READY, READY_WITH_WARNINGS
    summary: text("summary"),
    missingRequirements: jsonb("missing_requirements").$type<string[]>(),
    risks: jsonb("risks").$type<string[]>(),
    passedChecks: jsonb("passed_checks").$type<string[]>(),
    failedChecks: jsonb("failed_checks").$type<string[]>(),
    releaseNotes: jsonb("release_notes").$type<string[]>(),
    recommendations: jsonb("recommendations").$type<string[]>(),
    triggeredBy: varchar("triggered_by", { length: 255 }),
    triggerType: varchar("trigger_type", { length: 50 }), // manual, automatic
    model: varchar("model", { length: 100 }),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("release_runs_feature_id_created_at_idx").on(t.featureId, t.createdAt)],
);
