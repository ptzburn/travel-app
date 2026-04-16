import { createRoute, z } from "@hono/zod-openapi";
import authMiddleware from "~/api/middlewares/auth.middleware.ts";
import jsonContent from "~/api/utils/json-content.ts";
import createErrorSchema from "~/api/utils/open-api-schemas/create-error.schema.ts";
import serverErrorSchema from "~/api/utils/open-api-schemas/server-error.schema.ts";
import unauthorizedSchema from "~/api/utils/open-api-schemas/unauthorized.schema.ts";
import * as HttpStatus from "~/shared/http-status.ts";
import {
  MapboxFeatureSchema,
  MapboxSuggestionSchema,
  RetrieveQuerySchema,
  SuggestQuerySchema,
} from "~/shared/schemas/search.ts";
import { RetrieveParamsSchema } from "~/shared/schemas/zod.ts";
import { cache } from "hono/cache";

const tags = ["Search"];

export const suggest = createRoute({
  summary: "GET endpoint for fetching search suggestions",
  description:
    "Returns autocomplete suggestions from Mapbox Search Box API for the given query",
  tags,
  method: "get",
  path: "/search/suggest",
  middleware: [
    authMiddleware,
    cache({
      cacheName: "search-suggest",
      cacheControl: "max-age=3600",
      wait: true,
    }),
  ],
  request: {
    query: SuggestQuerySchema,
  },
  responses: {
    [HttpStatus.OK.CODE]: jsonContent(
      z.array(MapboxSuggestionSchema),
      "Array of Mapbox search suggestions",
    ),
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY.CODE]: jsonContent(
      createErrorSchema(SuggestQuerySchema),
      "Validation error(s)",
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
    [HttpStatus.GATEWAY_TIMEOUT.CODE]: jsonContent(
      serverErrorSchema,
      "Gateway timeout",
    ),
  },
});

export const retrieve = createRoute({
  summary: "GET endpoint for retrieving full feature details",
  description:
    "Retrieves full feature details including coordinates from Mapbox Search Box API",
  tags,
  method: "get",
  path: "/search/retrieve/{id}",
  middleware: [
    authMiddleware,
    cache({
      cacheName: "search-retrieve",
      cacheControl: "max-age=3600",
      wait: true,
    }),
  ],
  request: {
    params: RetrieveParamsSchema,
    query: RetrieveQuerySchema,
  },
  responses: {
    [HttpStatus.OK.CODE]: jsonContent(
      MapboxFeatureSchema,
      "Mapbox feature with coordinates",
    ),
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY.CODE]: jsonContent(
      createErrorSchema(RetrieveQuerySchema),
      "Validation error(s)",
    ),
    [HttpStatus.NOT_FOUND.CODE]: jsonContent(
      serverErrorSchema,
      "Feature not found",
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
    [HttpStatus.GATEWAY_TIMEOUT.CODE]: jsonContent(
      serverErrorSchema,
      "Gateway timeout",
    ),
  },
});

export type SuggestRoute = typeof suggest;
export type RetrieveRoute = typeof retrieve;
