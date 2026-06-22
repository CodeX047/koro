import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { projectsTable } from "./project";

export const reviewsTable = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  projectId: uuid("project_id").references(() => projectsTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
