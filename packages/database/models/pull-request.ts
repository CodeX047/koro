import { pgTable, uuid, varchar, text, integer, timestamp, unique, index } from "drizzle-orm/pg-core";

export const pullRequestsTable = pgTable("pull_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  installationId: integer("installation_id").notNull(),
  repoFullName: varchar("repo_full_name", { length: 255 }).notNull(),
  prNumber: integer("pr_number").notNull(),
  title: text("title").notNull(),
  authorLogin: varchar("author_login", { length: 255 }),
  headSha: varchar("head_sha", { length: 255 }).notNull(),
  baseBranch: varchar("base_branch", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  reviewComment: text("review_comment"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
}, (t) => [
  unique("repo_pr_unique").on(t.repoFullName, t.prNumber),
  index("pull_request_installation_id_idx").on(t.installationId),
]);
