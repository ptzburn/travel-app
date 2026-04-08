import { createRoute, z } from "@hono/zod-openapi";
import { notFoundSchema } from "~/api/lib/constants.ts";
import authMiddleware from "~/api/middlewares/auth.middleware.ts";
import jsonContentRequired from "~/api/utils/json-content-required.ts";
import jsonContent from "~/api/utils/json-content.ts";
import conflictSchema from "~/api/utils/open-api-schemas/conflict.schema.ts";
import createErrorSchema from "~/api/utils/open-api-schemas/create-error.schema.ts";
import forbiddenSchema from "~/api/utils/open-api-schemas/forbidden.schema.ts";
import serverErrorSchema from "~/api/utils/open-api-schemas/server-error.schema.ts";
import SlugParamsSchema from "~/api/utils/open-api-schemas/slug-params.schema.ts";
import unauthorizedSchema from "~/api/utils/open-api-schemas/unauthorized.schema.ts";
import * as HttpStatus from "~/shared/http-status.ts";
import {
  InsertLocation,
  SelectLocation,
  SelectLocationWithLogsSchema,
  UpdateLocation,
} from "~/shared/schemas/locations.ts";

const tags = ["Locations"];
const ParamsSchema = SlugParamsSchema("slug", "Location slug");

export const get = createRoute({
  summary: "GET endpoint for fetching locations",
  description: "Fetches all the location that the user has previously added",
  tags,
  method: "get",
  path: "/locations",
  middleware: [authMiddleware],
  responses: {
    [HttpStatus.OK.CODE]: jsonContent(
      z.array(SelectLocation),
      "Schema of location array",
    ),
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
  },
});

export const post = createRoute({
  summary: "POST endpoint for adding locations",
  description: "Adds a new location to the DB and then returns it",
  tags,
  method: "post",
  path: "/locations",
  middleware: [authMiddleware],
  request: {
    body: jsonContentRequired(
      InsertLocation,
      "Basic info for the new location",
    ),
  },
  responses: {
    [HttpStatus.OK.CODE]: jsonContent(
      SelectLocation,
      "Locaton schema",
    ),
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY.CODE]: jsonContent(
      createErrorSchema(InsertLocation),
      "Validation error(s)",
    ),
    [HttpStatus.CONFLICT.CODE]: jsonContent(
      conflictSchema,
      "Location already exists",
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
  },
});

export const put = createRoute({
  summary: "PUT endpoint for updating an existing location",
  description: "Updates the selected location in the DB and then returns it",
  tags,
  method: "put",
  path: "/locations/{slug}",
  middleware: [authMiddleware],
  request: {
    params: ParamsSchema,
    body: jsonContentRequired(
      UpdateLocation,
      "Location update schema",
    ),
  },
  responses: {
    [HttpStatus.OK.CODE]: jsonContent(
      SelectLocation,
      "Locaton schema",
    ),
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.FORBIDDEN.CODE]: jsonContent(
      forbiddenSchema,
      "Forbidden",
    ),
    [HttpStatus.NOT_FOUND.CODE]: jsonContent(
      notFoundSchema,
      "Not found",
    ),
    [HttpStatus.CONFLICT.CODE]: jsonContent(
      conflictSchema,
      "Location already exists",
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY.CODE]: jsonContent(
      createErrorSchema(UpdateLocation).or(ParamsSchema),
      "Validation error(s)",
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
  },
});

export const getOne = createRoute({
  summary: "GET endpoint for fetching a location",
  description: "Fetches the location that the user has previously added",
  tags,
  method: "get",
  path: "/locations/{slug}",
  middleware: [authMiddleware],
  request: {
    params: ParamsSchema,
  },
  responses: {
    [HttpStatus.OK.CODE]: jsonContent(
      SelectLocationWithLogsSchema,
      "Location schema",
    ),
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.FORBIDDEN.CODE]: jsonContent(
      forbiddenSchema,
      "Forbidden",
    ),
    [HttpStatus.NOT_FOUND.CODE]: jsonContent(
      notFoundSchema,
      "Not found",
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY.CODE]: jsonContent(
      createErrorSchema(ParamsSchema),
      "Validation error(s)",
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
  },
});

export const remove = createRoute({
  summary: "DELETE endpoint for deleting an existing location",
  description: "Deletes the selected location from the DB",
  tags,
  method: "delete",
  path: "/locations/{slug}",
  middleware: [authMiddleware],
  request: {
    params: ParamsSchema,
  },
  responses: {
    [HttpStatus.NO_CONTENT.CODE]: {
      description: "Location deleted",
    },
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.FORBIDDEN.CODE]: jsonContent(
      forbiddenSchema,
      "Forbidden",
    ),
    [HttpStatus.NOT_FOUND.CODE]: jsonContent(
      notFoundSchema,
      "Not found",
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY.CODE]: jsonContent(
      createErrorSchema(ParamsSchema),
      "Validation error(s)",
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
  },
});

export type GetRoute = typeof get;
export type PostRoute = typeof post;
export type PutRoute = typeof put;
export type GetOneRoute = typeof getOne;
export type RemoveRoute = typeof remove;
