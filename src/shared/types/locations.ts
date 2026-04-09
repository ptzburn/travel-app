import type {
  InsertLocation,
  SelectLocation,
  UpdateLocation,
} from "~/shared/schemas/locations.ts";
import type z from "zod";

export type LocationResponse = z.infer<typeof SelectLocation>;
export type CreateLocationInput = z.infer<typeof InsertLocation>;
export type UpdateLocationInput = z.infer<typeof UpdateLocation>;
