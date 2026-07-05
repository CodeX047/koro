import { pgTable, uuid, varchar, timestamp, text, index } from "drizzle-orm/pg-core";
import { organizationTable } from "./auth";

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  organizationId: text("organization_id")
    .references(() => organizationTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, (t) => [
  index("projects_organization_id_idx").on(t.organizationId),
]);
