import { locations } from "~/api/db/schema/index.ts";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { SelectLocationLogWithImages } from "./location-logs.ts";
import { DescriptionSchema, LatSchema, LongSchema, NameSchema } from "./zod.ts";

export const SelectLocation = createSelectSchema(locations, {
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export const SelectLocationWithLogsSchema = SelectLocation.extend({
  locationLogs: z.array(SelectLocationLogWithImages),
});
export const InsertLocation = createInsertSchema(locations, {
  name: NameSchema,
  description: DescriptionSchema,
  lat: LatSchema,
  long: LongSchema,
}).omit({
  id: true,
  slug: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export const UpdateLocation = InsertLocation.partial();

export const LocationQueryParams = z.object({
  search: z.string().optional(),
});
