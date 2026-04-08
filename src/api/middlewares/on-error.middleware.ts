import env from "~/env.ts";
import { INTERNAL_SERVER_ERROR, OK } from "~/shared/http-status.ts";

import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const onError: ErrorHandler = (err, c) => {
  const currentStatus = "status" in err
    ? err.status
    : c.newResponse(null).status;
  const statusCode = currentStatus !== OK.CODE
    ? (currentStatus as ContentfulStatusCode)
    : INTERNAL_SERVER_ERROR.CODE;
  const environment = env.NODE_ENV;

  return c.json(
    {
      message: err.message,

      stack: environment === "production" ? undefined : err.stack,
    },
    statusCode,
  );
};

export default onError;
