import type { AppBindings } from "~/api/types/hono.ts";

import { auth } from "~/shared/auth.ts";

import { UNAUTHORIZED } from "~/shared/http-status.ts";
import { createMiddleware } from "hono/factory";

const authMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.var.logger.error("Attempted action by unauthorized user");
    return c.json(
      { success: false, message: UNAUTHORIZED.MESSAGE },
      UNAUTHORIZED.CODE,
    );
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

export default authMiddleware;
