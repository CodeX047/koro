import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { featuresTable } from "./feature";

export type ClarificationStatus = "PENDING" | "ANSWERED" | "SKIPPED";

export const clarificationsTable = pgTable("clarifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  featureId: uuid("feature_id")
    .references(() => featuresTable.id, { onDelete: "cascade" })
    .notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  status: varchar("status", { length: 20 })
    .$type<ClarificationStatus>()
    .default("PENDING")
    .notNull(),
  order: integer("order").default(0).notNull(),
  createdBy: varchar("created_by", { length: 50 }).default("ai").notNull(),
  answeredAt: timestamp("answered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});
