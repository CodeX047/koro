import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { organizationTable } from "./auth";

export const subscriptionTable = pgTable("subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text("organization_id")
    .references(() => organizationTable.id, { onDelete: "cascade" })
    .notNull(),
  subscriptionId: text("subscription_id").notNull().unique(), // Dodo subscription ID
  customerId: text("customer_id").notNull(), // Dodo customer ID
  planId: varchar("plan_id", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // e.g., 'active', 'cancelled', 'past_due'
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: timestamp("cancel_at_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
