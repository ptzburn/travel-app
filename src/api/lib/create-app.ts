import { OpenAPIHono } from "@hono/zod-openapi";
import { pinoLogger } from "~/api/middlewares/logger.middleware.ts";
import notFound from "~/api/middlewares/not-found.middleware.ts";
import onError from "~/api/middlewares/on-error.middleware.ts";
import type { AppBindings } from "~/api/types/hono.ts";
import defaultHook from "~/api/utils/default-hook.ts";
import { auth } from "~/shared/auth.ts";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { poweredBy } from "hono/powered-by";
import { requestId } from "hono/request-id";

export function createRouter(): OpenAPIHono<AppBindings> {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp(): OpenAPIHono<AppBindings> {
  const app = createRouter();
  app
    .use("/api/*", cors())
    .use(pinoLogger())
    .use(csrf())
    .use(contextStorage())
    .use(requestId())
    .use(poweredBy())
    .use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);
  // deno-lint-ignore require-await
  app.on(["POST", "GET"], "/api/auth/**", async (c) => {
    if (c.req.path === "/api/auth/error") {
      const error = c.req.query("error");
      const redirectUrl = error ? `/auth/error?error=${error}` : "/auth/error";
      return c.redirect(redirectUrl);
    }
    return auth.handler(c.req.raw);
  });
  return app;
}
