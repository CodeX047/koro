import { pgTable, uuid, text, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { organizationTable } from "./auth";
import { usersTable } from "./user";

export const githubIntegrationsTable = pgTable("github_integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id")
    .references(() => organizationTable.id, { onDelete: "cascade" })
    .notNull(),
  accessToken: text("access_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const githubInstallationsTable = pgTable("github_installations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  installationId: integer("installation_id").notNull(),
  accountLogin: varchar("account_login", { length: 255 }),
  accountType: varchar("account_type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});

