import type {
  AppRouteHandler,
  HandlerContext,
  HandlerReturn,
} from "~/api/types/hono.ts";
import env from "~/env.ts";
import { GATEWAY_TIMEOUT, OK } from "~/shared/http-status.ts";
import type { NominatimResult } from "~/shared/types/search.ts";
import { HTTPException } from "hono/http-exception";
import type { GetRoute } from "./routes.ts";

export const get: AppRouteHandler<GetRoute> = async (
  c: HandlerContext<GetRoute>,
): HandlerReturn<GetRoute> => {
  const { q } = c.req.valid("query");

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json`,
    {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": `Travel App | ${env.CONTACT_EMAIL}`,
      },
    },
  );

  if (!response.ok) {
    throw new HTTPException(GATEWAY_TIMEOUT.CODE, {
      message: GATEWAY_TIMEOUT.MESSAGE,
    });
  }

  const json = await response.json() as NominatimResult[];

  return c.json(json, OK.CODE);
};
