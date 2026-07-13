import { pgTable, text, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { organizationTable } from "./auth";

export const invoiceTable = pgTable("invoice", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text("organization_id")
    .references(() => organizationTable.id, { onDelete: "cascade" })
    .notNull(),
  invoiceId: text("invoice_id").notNull().unique(), // Dodo Invoice ID or Payment ID
  currency: varchar("currency", { length: 10 }).notNull(),
  subtotal: integer("subtotal").notNull(), // stored in cents
  tax: integer("tax").default(0).notNull(), // stored in cents
  total: integer("total").notNull(), // stored in cents
  status: varchar("status", { length: 50 }).notNull(),
  hostedInvoiceUrl: text("hosted_invoice_url"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
