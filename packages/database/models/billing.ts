import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { organizationTable } from "./auth";

export const billingsTable = pgTable("billings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id")
    .references(() => organizationTable.id, { onDelete: "cascade" })
    .notNull(),
  plan: varchar("plan", { length: 50 }).default("free").notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
