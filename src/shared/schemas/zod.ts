import * as m from "~/paraglide/messages.js";
import { z } from "zod";

export const SearchSchema = z.object({
  q: z.string().trim().min(1, m.validation_search_required()),
});

export type SearchSchema = z.infer<typeof SearchSchema>;

export const NameSchema = z.string().min(1).max(100);
export const DescriptionSchema = z.string().max(1000).or(z.null());
export const LatSchema = z.number().min(-90).max(90);
export const LongSchema = z.number().min(-180).max(180);
export const DateSchema = z.iso.datetime({
  message: m.validation_date_required(),
});

export const NominatimResultSchema = z.object({
  place_id: z.number(),
  licence: z.string(),
  osm_type: z.string(),
  osm_id: z.number(),
  lat: z.string(),
  lon: z.string(),
  class: z.string(),
  type: z.string(),
  place_rank: z.number(),
  importance: z.number(),
  addresstype: z.string(),
  name: z.string(),
  display_name: z.string(),
  boundingbox: z.array(z.string()),
});
