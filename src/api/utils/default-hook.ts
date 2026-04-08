import type { Hook } from "@hono/zod-openapi";

import { UNPROCESSABLE_ENTITY } from "~/shared/http-status.ts";

// deno-lint-ignore no-explicit-any
const defaultHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json(
      {
        success: result.success,
        error: {
          name: result.error.name,
          issues: result.error.issues,
        },
      },
      UNPROCESSABLE_ENTITY.CODE,
    );
  }
};

export default defaultHook;
