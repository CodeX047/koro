import { pgTable, uuid, varchar, text, timestamp, integer, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { projectsTable } from "./project";
import { featuresTable } from "./feature";
import { prdsTable } from "./prd";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskComplexity = "LOW" | "MEDIUM" | "HIGH";
export type TaskCategory = "frontend" | "backend" | "database" | "testing" | "devops" | "documentation" | "other";

export const tasksTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projectsTable.id).notNull(),
  featureId: uuid("feature_id").references(() => featuresTable.id),
  prdId: uuid("prd_id").references(() => prdsTable.id),
  parentTaskId: uuid("parent_task_id"), // Self-reference for Epics -> Tasks -> Subtasks
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).$type<TaskStatus>().default("TODO").notNull(),
  priority: varchar("priority", { length: 50 }).$type<TaskPriority>().default("MEDIUM").notNull(),
  complexity: varchar("complexity", { length: 50 }).$type<TaskComplexity>().default("MEDIUM").notNull(),
  category: varchar("category", { length: 50 }).$type<TaskCategory>().default("other").notNull(),
  estimatedHours: integer("estimated_hours"),
  assigneeId: varchar("assignee_id", { length: 255 }), // Can link to auth users table later
  order: integer("order").default(0).notNull(), // Position in the Kanban column
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const taskDependenciesTable = pgTable("task_dependencies", {
  taskId: uuid("task_id").references(() => tasksTable.id, { onDelete: "cascade" }).notNull(),
  dependsOnTaskId: uuid("depends_on_task_id").references(() => tasksTable.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.taskId, t.dependsOnTaskId] }),
]);

