import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { workspacesTable } from "./workspace";

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  workspaceId: uuid("workspace_id").references(() => workspacesTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
