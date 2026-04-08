import env from "~/env.ts";
import type { MiddlewareHandler } from "hono";
import { type PinoLogger, pinoLogger as logger } from "hono-pino";

import pino from "pino";
import pretty from "pino-pretty";

export function pinoLogger(): MiddlewareHandler<{
  Variables: {
    logger: PinoLogger;
  };
}> {
  return logger({
    pino: pino({
      level: env.LOG_LEVEL || "info",
    }, env.NODE_ENV === "production" ? undefined : pretty()),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}
