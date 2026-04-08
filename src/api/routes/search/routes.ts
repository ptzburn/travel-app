import { createRoute, z } from "@hono/zod-openapi";
import authMiddleware from "~/api/middlewares/auth.middleware.ts";
import jsonContent from "~/api/utils/json-content.ts";
import createErrorSchema from "~/api/utils/open-api-schemas/create-error.schema.ts";
import serverErrorSchema from "~/api/utils/open-api-schemas/server-error.schema.ts";
import unauthorizedSchema from "~/api/utils/open-api-schemas/unauthorized.schema.ts";
import * as HttpStatus from "~/shared/http-status.ts";
import { NominatimResultSchema, SearchSchema } from "~/shared/schemas/zod.ts";
import { cache } from "hono/cache";

const tags = ["Search"];

export const get = createRoute({
  summary: "GET endpoint for fetching points of interest on the map",
  description: "Fetches points of interest on the map by query",
  tags,
  method: "get",
  path: "/search",
  middleware: [
    authMiddleware,
    cache({
      cacheName: "search-nominatim",
      cacheControl: "max-age=3600",
      wait: true,
    }),
  ],
  request: {
    query: SearchSchema,
  },
  responses: {
    [HttpStatus.OK.CODE]: jsonContent(
      z.array(NominatimResultSchema),
      "Schema of the nominatim location results",
    ),
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY.CODE]: jsonContent(
      createErrorSchema(SearchSchema),
      "Validation error(s)",
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
    [HttpStatus.GATEWAY_TIMEOUT.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
  },
});

export type GetRoute = typeof get;
