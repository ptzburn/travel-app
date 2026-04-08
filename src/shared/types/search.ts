import type {
  NominatimResultSchema,
  SearchSchema,
} from "~/shared/schemas/zod.ts";
import type z from "zod";

export type NominatimResult = z.infer<typeof NominatimResultSchema>;
export type SearchQuery = z.infer<typeof SearchSchema>;
