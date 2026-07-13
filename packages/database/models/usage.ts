import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { organizationTable } from "./auth";

export const usageTable = pgTable("usage", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text("organization_id")
    .references(() => organizationTable.id, { onDelete: "cascade" })
    .notNull(),
  month: text("month").notNull(), // Format: 'YYYY-MM'
  aiReviewsUsed: integer("ai_reviews_used").default(0).notNull(),
  repositoriesUsed: integer("repositories_used").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
