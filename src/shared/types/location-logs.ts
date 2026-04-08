import type {
  InsertLocationLog,
  UpdateLocationLog,
} from "~/shared/schemas/location-logs.ts";
import type z from "zod";

export type CreateLocationLogInput = z.infer<typeof InsertLocationLog>;
export type UpdateLocationLogInput = z.infer<typeof UpdateLocationLog>;
