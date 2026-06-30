import { pgTable, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { organizationTable } from "./auth";

export const billingEventTable = pgTable("billing_event", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id").notNull().unique(), // Webhook ID from Dodo
  provider: varchar("provider", { length: 50 }).default("dodo").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  organizationId: text("organization_id").references(() => organizationTable.id, { onDelete: "set null" }), // Optional, as some webhooks might not immediately resolve to org
  status: varchar("status", { length: 50 }).default("processed").notNull(),
  receivedAt: timestamp("received_at").notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
  payloadHash: text("payload_hash"),
  error: text("error"),
  retryCount: integer("retry_count").default(0).notNull(),
});
