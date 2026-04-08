import type { locationLogs } from "~/api/db/schema/index.ts";

export type SelectLocationLog = typeof locationLogs.$inferSelect;
export type InsertLocationLog = Omit<
  typeof locationLogs.$inferInsert,
  "userId" | "locationId" | "createdAt" | "updatedAt" | "id"
>;
export type UpdateLocationLog = Partial<InsertLocationLog>;
