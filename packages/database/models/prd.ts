import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { featuresTable } from "./feature";

export const prdsTable = pgTable("prds", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  featureId: uuid("feature_id").references(() => featuresTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
