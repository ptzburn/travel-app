import * as m from "~/paraglide/messages.js";
import z from "zod";

export const SuggestQuerySchema = z.object({
  q: z.string().trim().min(1, m.validation_search_required()).max(256),
  session_token: z.uuid(),
  language: z.enum(["en", "fi", "sv", "ru"]).optional(),
  limit: z.coerce.number().int().min(1).max(10).optional(),
  proximity: z.string().optional(),
  bbox: z.string().optional(),
  country: z.string().optional(),
  types: z.string().optional(),
  poi_category: z.string().optional(),
  poi_category_exclusions: z.string().optional(),
  eta_type: z.literal("navigation").optional(),
  navigation_profile: z.enum(["driving", "walking", "cycling"]).optional(),
  origin: z.string().optional(),
});

export const RetrieveQuerySchema = z.object({
  session_token: z.uuid(),
  language: z.enum(["en", "fi", "sv", "ru"]).optional(),
  eta_type: z.literal("navigation").optional(),
  navigation_profile: z.enum(["driving", "walking", "cycling"]).optional(),
  origin: z.string().optional(),
});

export const MapboxContextLayerSchema = z.looseObject({
  id: z.string().optional(),
  name: z.string().optional(),
});

const MapboxCountryContextSchema = z.looseObject({
  id: z.string().optional(),
  name: z.string().optional(),
  country_code: z.string().optional(),
  country_code_alpha_3: z.string().optional(),
});

const MapboxRegionContextSchema = z.looseObject({
  id: z.string().optional(),
  name: z.string().optional(),
  region_code: z.string().optional(),
  region_code_full: z.string().optional(),
});

const MapboxAddressContextSchema = z.looseObject({
  id: z.string().optional(),
  name: z.string().optional(),
  address_number: z.string().optional(),
  street_name: z.string().optional(),
});

const MapboxContextSchema = z.object({
  country: MapboxCountryContextSchema.optional(),
  region: MapboxRegionContextSchema.optional(),
  postcode: MapboxContextLayerSchema.optional(),
  district: MapboxContextLayerSchema.optional(),
  place: MapboxContextLayerSchema.optional(),
  locality: MapboxContextLayerSchema.optional(),
  neighborhood: MapboxContextLayerSchema.optional(),
  address: MapboxAddressContextSchema.optional(),
  street: MapboxContextLayerSchema.optional(),
});

export const MapboxSuggestionSchema = z.object({
  name: z.string(),
  name_preferred: z.string().optional(),
  mapbox_id: z.string(),
  feature_type: z.enum([
    "poi",
    "category",
    "country",
    "region",
    "place",
    "district",
    "neighborhood",
    "address",
    "locality",
    "postcode",
  ]),
  address: z.string().optional(),
  full_address: z.string().optional(),
  place_formatted: z.string(),
  context: MapboxContextSchema,
  language: z.string(),
  maki: z.string().optional(),
  poi_category: z.array(z.string()).optional(),
  poi_category_ids: z.array(z.string()).optional(),
  brand: z.array(z.string()).optional(),
  brand_id: z.array(z.string()).optional(),
  external_ids: z.record(z.string(), z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  distance: z.number().optional(),
  eta: z.number().optional(),
  added_distance: z.number().optional(),
  added_time: z.number().optional(),
});

const MapboxRoutablePointSchema = z.looseObject({
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  note: z.string().optional(),
});

const MapboxCoordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z
    .enum([
      "rooftop",
      "parcel",
      "point",
      "interpolated",
      "intersection",
      "approximate",
      "street",
    ])
    .optional(),
  routable_points: z.array(MapboxRoutablePointSchema).optional(),
});

export const MapboxFeatureSchema = z.looseObject({
  type: z.literal("Feature"),
  geometry: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  properties: z
    .object({
      name: z.string(),
      name_preferred: z.string().optional(),
      mapbox_id: z.string(),
      feature_type: z.enum([
        "poi",
        "country",
        "region",
        "place",
        "district",
        "neighborhood",
        "address",
        "locality",
        "postcode",
      ]),
      address: z.string().optional(),
      full_address: z.string().optional(),
      place_formatted: z.string().optional(),
      context: MapboxContextSchema,
      coordinates: MapboxCoordinatesSchema,
      bbox: z
        .tuple([z.number(), z.number(), z.number(), z.number()])
        .optional(),
      language: z.string().optional(),
      maki: z.string().optional(),
      poi_category: z.array(z.string()).optional(),
      poi_category_ids: z.array(z.string()).optional(),
      brand: z.array(z.string()).optional(),
      brand_id: z.array(z.string()).optional(),
      external_ids: z.record(z.string(), z.string()).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }),
});
