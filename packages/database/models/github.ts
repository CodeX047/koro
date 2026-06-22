import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { workspacesTable } from "./workspace";

export const githubIntegrationsTable = pgTable("github_integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspacesTable.id).notNull(),
  accessToken: text("access_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
