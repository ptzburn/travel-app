import { locationLogs } from "~/api/db/schema/location-logs.ts";
import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth.ts";

export const locationLogImages = sqliteTable("locationLogImages", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull(),
  locationLogId: int().notNull().references(() => locationLogs.id, {
    onDelete: "cascade",
  }),
  userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: int({ mode: "timestamp_ms" }).default(
    sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
  ).notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).default(
    sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
  ).$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
});
