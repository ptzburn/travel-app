import type { locationLogImages } from "~/api/db/schema/index.ts";

export type SelectLocationLogImage = typeof locationLogImages.$inferSelect;
export type InsertLocationLogImage = typeof locationLogImages.$inferInsert;
export type UpdateLocationLogImage = Partial<InsertLocationLogImage>;
