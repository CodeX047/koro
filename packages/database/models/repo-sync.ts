import { pgTable, uuid, varchar, text, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const repoSyncTable = pgTable("repo_sync", {
  id: uuid("id").primaryKey().defaultRandom(),
  installationId: integer("installation_id").notNull(),
  repoFullName: varchar("repo_full_name", { length: 255 }).notNull(),
  branch: varchar("branch", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  chunkCount: integer("chunk_count").default(0).notNull(),
  syncedAt: timestamp("synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
}, (t) => [
  unique("repo_sync_repo_unique").on(t.repoFullName),
]);
