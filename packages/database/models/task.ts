import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { projectsTable } from "./project";

export const tasksTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("todo").notNull(),
  projectId: uuid("project_id").references(() => projectsTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
