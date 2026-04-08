import { locationLogs } from "~/api/db/schema/index.ts";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { SelectLocationLogImage } from "./location-log-images.ts";
import {
  DateSchema,
  DescriptionSchema,
  LatSchema,
  LongSchema,
  NameSchema,
} from "./zod.ts";

export const SelectLocationLog = createSelectSchema(locationLogs);

export const SelectLocationLogWithImages = SelectLocationLog.extend({
  images: z.array(SelectLocationLogImage),
});

export const InsertLocationLog = createInsertSchema(locationLogs, {
  name: NameSchema,
  description: DescriptionSchema,
  lat: LatSchema,
  long: LongSchema,
  startedAt: DateSchema,
  endedAt: DateSchema,
}).omit({
  id: true,
  userId: true,
  locationId: true,
  createdAt: true,
  updatedAt: true,
}).superRefine((values, context) => {
  if (values.startedAt > values.endedAt || values.endedAt < values.startedAt) {
    context.addIssue({
      code: "custom",
      message: "Start Date must be before End Date",
      path: ["startedAt"],
    });
    context.addIssue({
      code: "custom",
      message: "End Date must be after Start Date",
      path: ["endedAt"],
    });
  }
});

export const UpdateLocationLog = createUpdateSchema(locationLogs, {
  name: NameSchema,
  description: DescriptionSchema,
  lat: LatSchema,
  long: LongSchema,
  startedAt: DateSchema,
  endedAt: DateSchema,
}).omit({
  id: true,
  userId: true,
  locationId: true,
  createdAt: true,
  updatedAt: true,
}).superRefine((values, context) => {
  if (values.startedAt > values.endedAt || values.endedAt < values.startedAt) {
    context.addIssue({
      code: "custom",
      message: "Start Date must be before End Date",
      path: ["startedAt"],
    });
    context.addIssue({
      code: "custom",
      message: "End Date must be after Start Date",
      path: ["endedAt"],
    });
  }
});
