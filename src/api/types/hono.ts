import type { RouteConfig, RouteHandler, z } from "@hono/zod-openapi";
import type { SelectSession, SelectUser } from "~/shared/types/auth.ts";
import type { PinoLogger } from "hono-pino";

export type AppBindings = {
  Variables: {
    logger: PinoLogger;
    user: SelectUser;
    session: SelectSession;
  };
};

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;

export type HandlerContext<R extends RouteConfig> = Parameters<
  AppRouteHandler<R>
>[0];
export type HandlerReturn<R extends RouteConfig> = Promise<
  Awaited<ReturnType<AppRouteHandler<R>>>
>;

export type SyncHandlerReturn<R extends RouteConfig> = ReturnType<
  AppRouteHandler<R>
>;

export type ZodSchema =
  | z.ZodUnion
  | z.ZodObject
  | z.ZodArray<z.ZodObject>
  | z.ZodArray<z.ZodDate>
  | z.ZodArray<z.ZodISODateTime>;
