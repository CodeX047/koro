import { pgTable, uuid, varchar, text, integer, timestamp, unique, index, boolean, jsonb } from "drizzle-orm/pg-core";
import { repositoriesTable } from "./github";
import { tasksTable } from "./task";
import { featuresTable } from "./feature";

export const pullRequestsTable = pgTable("pull_request", { // Renamed from pull_request
  id: uuid("id").primaryKey().defaultRandom(),
  installationId: integer("installation_id").notNull(),
  repoFullName: varchar("repo_full_name", { length: 255 }).notNull(),
  repositoryId: uuid("repository_id").references(() => repositoriesTable.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => tasksTable.id, { onDelete: "set null" }),
  featureId: uuid("feature_id").references(() => featuresTable.id, { onDelete: "cascade" }),
  prNumber: integer("pr_number").notNull(),
  title: text("title").notNull(),
  url: varchar("url", { length: 1024 }),
  authorLogin: varchar("author_login", { length: 255 }),
  headSha: varchar("head_sha", { length: 255 }).notNull(),
  headBranch: varchar("head_branch", { length: 255 }),
  baseBranch: varchar("base_branch", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("OPENED").notNull(), // OPENED, READY_FOR_REVIEW, CHANGES_REQUESTED, APPROVED, MERGED, CLOSED
  merged: boolean("merged").default(false).notNull(),
  reviewStatus: varchar("review_status", { length: 50 }), // PENDING, RUNNING, COMPLETED, FAILED
  reviewVersion: integer("review_version").default(0).notNull(),
  reviewComment: text("review_comment"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
}, (t) => [
  unique("repo_pr_unique").on(t.repoFullName, t.prNumber),
  index("pull_request_installation_id_idx").on(t.installationId),
]);

export const changedFilesTable = pgTable("changed_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  prId: uuid("pr_id").references(() => pullRequestsTable.id, { onDelete: "cascade" }).notNull(),
  filename: text("filename").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  additions: integer("additions").default(0).notNull(),
  deletions: integer("deletions").default(0).notNull(),
  patch: text("patch"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commitsTable = pgTable("commits", {
  id: uuid("id").primaryKey().defaultRandom(),
  prId: uuid("pr_id").references(() => pullRequestsTable.id, { onDelete: "cascade" }).notNull(),
  sha: varchar("sha", { length: 255 }).notNull(),
  message: text("message").notNull(),
  author: varchar("author", { length: 255 }),
  timestamp: timestamp("timestamp"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewRunsTable = pgTable("review_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  prId: uuid("pr_id").references(() => pullRequestsTable.id, { onDelete: "cascade" }).notNull(),
  headSha: varchar("head_sha", { length: 255 }).notNull(),
  attempt: integer("attempt").notNull(),
  score: integer("score"),
  scoreBreakdown: jsonb("score_breakdown"), // { correctness, security, performance, maintainability, requirements }
  verdict: varchar("verdict", { length: 50 }), // REQUEST_CHANGES, COMMENT, APPROVE
  model: varchar("model", { length: 100 }),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("review_runs_pr_idx").on(t.prId),
]);
