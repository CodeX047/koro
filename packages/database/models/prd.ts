import { pgTable, uuid, varchar, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { featuresTable } from "./feature";

export const prdsTable = pgTable("prds", {
  id: uuid("id").primaryKey().defaultRandom(),
  featureId: uuid("feature_id")
    .references(() => featuresTable.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),

  // Structured sections (queryable individually)
  problemStatement: text("problem_statement"),
  goals: jsonb("goals").$type<string[]>().default([]),
  nonGoals: jsonb("non_goals").$type<string[]>().default([]),
  userStories: jsonb("user_stories").$type<string[]>().default([]),
  acceptanceCriteria: jsonb("acceptance_criteria").$type<string[]>().default([]),
  edgeCases: jsonb("edge_cases").$type<string[]>().default([]),
  successMetrics: jsonb("success_metrics").$type<string[]>().default([]),

  // Markdown fallback (for quick rendering)
  content: text("content"),

  // Generation provenance
  version: integer("version").default(1).notNull(),
  model: varchar("model", { length: 255 }),
  generationTimeMs: integer("generation_time_ms"),
  generatedAt: timestamp("generated_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
