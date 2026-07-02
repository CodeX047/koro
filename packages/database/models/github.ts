import { pgTable, uuid, text, timestamp, integer, varchar, boolean } from "drizzle-orm/pg-core";
import { organizationTable } from "./auth";
import { usersTable } from "./user";

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

export const repositoriesTable = pgTable("repositories", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id").references(() => organizationTable.id, { onDelete: "cascade" }).notNull(),
  projectId: uuid("project_id").notNull(), // Assuming projectTable reference isn't circular/direct import needed or we can import projectTable
  installationId: integer("installation_id").notNull(),
  owner: varchar("owner", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  defaultBranch: varchar("default_branch", { length: 255 }),
  private: boolean("private").default(false).notNull(),
  syncStatus: varchar("sync_status", { length: 50 }).default("CONNECTED").notNull(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});

export const githubIssuesTable = pgTable("github_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull(),
  githubIssueId: integer("github_issue_id").notNull(),
  issueNumber: integer("issue_number").notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  nodeId: varchar("node_id", { length: 255 }),
  state: varchar("state", { length: 50 }).notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});

