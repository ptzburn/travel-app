import { NOT_FOUND } from "~/shared/http-status.ts";

import type { NotFoundHandler } from "hono";

const notFound: NotFoundHandler = (c) => {
  return c.json({
    message: `${NOT_FOUND.MESSAGE} - ${c.req.path}`,
  }, NOT_FOUND.CODE);
};

export default notFound;
