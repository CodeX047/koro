import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { projectsTable } from "./project";

export type FeatureStatus =
  | "DRAFT"
  | "CLARIFICATION_PENDING"
  | "CLARIFICATION_COMPLETE"
  | "PRD_GENERATING"
  | "PRD_READY"
  | "TASKS_GENERATING"
  | "TASKS_DRAFT"
  | "PLANNING_COMPLETE"
  | "FAILED";

export const featuresTable = pgTable("features", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 })
    .$type<FeatureStatus>()
    .default("DRAFT")
    .notNull(),
  projectId: uuid("project_id").references(() => projectsTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, (t) => [
  index("features_project_id_idx").on(t.projectId),
  index("features_project_id_created_at_idx").on(t.projectId, t.createdAt),
]);
