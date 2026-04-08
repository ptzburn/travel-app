import { sql } from "drizzle-orm";
import { int, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { users } from "./auth.ts";

export const locations = sqliteTable("locations", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  lat: real().notNull(),
  long: real().notNull(),
  userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: int({ mode: "timestamp_ms" }).default(
    sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
  ).notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).default(
    sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
  ).$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
}, (table) => [
  unique().on(table.name, table.userId),
]);
