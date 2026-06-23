import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { organizationTable } from "./auth";

export const githubIntegrationsTable = pgTable("github_integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id")
    .references(() => organizationTable.id, { onDelete: "cascade" })
    .notNull(),
  accessToken: text("access_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
