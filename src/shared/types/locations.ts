import type {
  InsertLocation,
  UpdateLocation,
} from "~/shared/schemas/locations.ts";
import type z from "zod";

export type CreateLocationInput = z.infer<typeof InsertLocation>;
export type UpdateLocationInput = z.infer<typeof UpdateLocation>;
