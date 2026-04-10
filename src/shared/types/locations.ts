import type {
  InsertLocation,
  LocationQueryParams,
  SelectLocation,
  UpdateLocation,
} from "~/shared/schemas/locations.ts";
import type z from "zod";

export type LocationResponse = z.infer<typeof SelectLocation>;
export type CreateLocationInput = z.infer<typeof InsertLocation>;
export type UpdateLocationInput = z.infer<typeof UpdateLocation>;
export type LocationQueryParams = z.infer<typeof LocationQueryParams>;
