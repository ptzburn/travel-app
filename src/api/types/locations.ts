import type { locations } from "~/api/db/schema/index.ts";

export type SelectLocation = typeof locations.$inferSelect;
export type InsertLocation = Omit<
  typeof locations.$inferInsert,
  "userId" | "slug"
>;
export type UpdateLocation = Partial<InsertLocation>;
