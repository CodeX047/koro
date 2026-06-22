import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { projectsTable } from "./project";

export const pullRequestsTable = pgTable("pull_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: integer("number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  projectId: uuid("project_id").references(() => projectsTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
