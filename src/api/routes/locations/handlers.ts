import {
  findLocations,
  findLocationWithLogs,
  findUniqueSlug,
  insertLocation,
  removeLocationBySlug,
  updateLocationBySlug,
} from "~/api/routes/locations/services.ts";
import type {
  AppRouteHandler,
  HandlerContext,
  HandlerReturn,
} from "~/api/types/hono.ts";
import { NO_CONTENT, OK, UNPROCESSABLE_ENTITY } from "~/shared/http-status.ts";
import { HTTPException } from "hono/http-exception";
import slugify from "slug";
import type {
  GetOneRoute,
  GetRoute,
  PostRoute,
  PutRoute,
  RemoveRoute,
} from "./routes.ts";

export const get: AppRouteHandler<GetRoute> = async (
  c: HandlerContext<GetRoute>,
): HandlerReturn<GetRoute> => {
  const user = c.get("user");
  const { search } = c.req.valid("query");

  const locations = await findLocations(Number(user.id), { search });

  return c.json(locations, OK.CODE);
};

export const post: AppRouteHandler<PostRoute> = async (
  c: HandlerContext<PostRoute>,
): HandlerReturn<PostRoute> => {
  const locationData = c.req.valid("json");
  const user = c.get("user");

  const slug = await findUniqueSlug(slugify(locationData.name));

  const newLocation = await insertLocation(locationData, slug, Number(user.id));

  return c.json(newLocation, OK.CODE);
};

export const put: AppRouteHandler<PutRoute> = async (
  c: HandlerContext<PutRoute>,
): HandlerReturn<PutRoute> => {
  const updates = c.req.valid("json");
  const { slug } = c.req.valid("param");
  const user = c.get("user");

  if (Object.keys(updates).length === 0) {
    throw new HTTPException(UNPROCESSABLE_ENTITY.CODE, {
      message: UNPROCESSABLE_ENTITY.MESSAGE,
    });
  }

  const updatedLocation = await updateLocationBySlug(
    updates,
    slug,
    Number(user.id),
  );

  return c.json(updatedLocation, OK.CODE);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (
  c: HandlerContext<GetOneRoute>,
): HandlerReturn<GetOneRoute> => {
  const user = c.get("user");
  const { slug } = c.req.valid("param");

  const location = await findLocationWithLogs(slug, Number(user.id));

  return c.json(location, OK.CODE);
};

export const remove: AppRouteHandler<RemoveRoute> = async (
  c: HandlerContext<RemoveRoute>,
): Promise<Response> => {
  const { slug } = c.req.valid("param");
  const user = c.get("user");

  await removeLocationBySlug(slug, Number(user.id));

  return c.body(null, NO_CONTENT.CODE);
};
