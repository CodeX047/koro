import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { workspacesTable } from "./workspace";

export const billingsTable = pgTable("billings", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspacesTable.id).notNull(),
  plan: varchar("plan", { length: 50 }).default("free").notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
