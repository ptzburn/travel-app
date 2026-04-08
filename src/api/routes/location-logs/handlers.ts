import {
  findLocationBySlug,
  findLocationWithLogs,
} from "~/api/routes/locations/services.ts";
import type {
  AppRouteHandler,
  HandlerContext,
  HandlerReturn,
} from "~/api/types/hono.ts";
import {
  FORBIDDEN,
  NO_CONTENT,
  NOT_FOUND,
  OK,
  UNPROCESSABLE_ENTITY,
} from "~/shared/http-status.ts";
import { HTTPException } from "hono/http-exception";
import type { GetRoute, PostRoute, PutRoute, RemoveRoute } from "./routes.ts";
import {
  deleteLocationLog,
  findLocationLog,
  insertLocationLog,
  updateLocationLog,
} from "./services.ts";

export const get: AppRouteHandler<GetRoute> = async (
  c: HandlerContext<GetRoute>,
): HandlerReturn<GetRoute> => {
  const { slug, id } = c.req.valid("param");
  const user = c.get("user");

  const location = await findLocationBySlug(slug);

  if (!location) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  if (Number(location.userId) !== Number(user.id)) {
    throw new HTTPException(FORBIDDEN.CODE, {
      message: FORBIDDEN.MESSAGE,
    });
  }

  const locationLog = await findLocationLog(Number(id), Number(user.id));

  return c.json(locationLog, OK.CODE);
};

export const post: AppRouteHandler<PostRoute> = async (
  c: HandlerContext<PostRoute>,
): HandlerReturn<PostRoute> => {
  const locationLogData = c.req.valid("json");
  const { slug } = c.req.valid("param");
  const user = c.get("user");

  const location = await findLocationWithLogs(slug, Number(user.id));

  const newLocationLog = await insertLocationLog(
    location.id,
    {
      ...locationLogData,
      startedAt: new Date(locationLogData.startedAt),
      endedAt: new Date(locationLogData.endedAt),
    },
    Number(user.id),
  );

  return c.json(newLocationLog, OK.CODE);
};

export const put: AppRouteHandler<PutRoute> = async (
  c: HandlerContext<PutRoute>,
): HandlerReturn<PutRoute> => {
  const updates = c.req.valid("json");
  const { id } = c.req.valid("param");
  const user = c.get("user");

  if (Object.keys(updates).length === 0) {
    throw new HTTPException(UNPROCESSABLE_ENTITY.CODE, {
      message: UNPROCESSABLE_ENTITY.MESSAGE,
    });
  }

  const updatedLocationLog = await updateLocationLog(
    Number(id),
    {
      ...updates,
      startedAt: new Date(updates.startedAt),
      endedAt: new Date(updates.endedAt),
    },
    Number(user.id),
  );

  return c.json(updatedLocationLog, OK.CODE);
};

export const remove: AppRouteHandler<RemoveRoute> = async (
  c: HandlerContext<RemoveRoute>,
): Promise<Response> => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  await deleteLocationLog(Number(id), Number(user.id));

  return c.body(null, NO_CONTENT.CODE);
};
