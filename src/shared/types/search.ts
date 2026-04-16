import type {
  MapboxFeatureSchema,
  MapboxSuggestionSchema,
  RetrieveQuerySchema,
  SuggestQuerySchema,
} from "~/shared/schemas/search.ts";
import type z from "zod";

export type MapboxSuggestion = z.infer<typeof MapboxSuggestionSchema>;
export type MapboxFeature = z.infer<typeof MapboxFeatureSchema>;
export type SuggestQuery = z.infer<typeof SuggestQuerySchema>;
export type RetrieveQuery = z.infer<typeof RetrieveQuerySchema>;
