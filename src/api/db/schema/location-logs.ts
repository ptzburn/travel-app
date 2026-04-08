import { locations } from "~/api/db/schema/locations.ts";
import { sql } from "drizzle-orm";
import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth.ts";

export const locationLogs = sqliteTable("locationLogs", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  startedAt: int({ mode: "timestamp_ms" }).notNull(),
  endedAt: int({ mode: "timestamp_ms" }).notNull(),
  lat: real().notNull(),
  long: real().notNull(),
  locationId: int().notNull().references(() => locations.id, {
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
