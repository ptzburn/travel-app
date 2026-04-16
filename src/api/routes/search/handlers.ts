import type {
  AppRouteHandler,
  HandlerContext,
  HandlerReturn,
} from "~/api/types/hono.ts";
import env from "~/env.ts";
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "~/shared/http-status.ts";
import type { MapboxFeature, MapboxSuggestion } from "~/shared/types/search.ts";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { RetrieveRoute, SuggestRoute } from "./routes.ts";

export const suggest: AppRouteHandler<SuggestRoute> = async (
  c: HandlerContext<SuggestRoute>,
): HandlerReturn<SuggestRoute> => {
  const {
    q,
    session_token,
    language,
    limit,
    proximity,
    bbox,
    country,
    types,
    poi_category,
    poi_category_exclusions,
    eta_type,
    navigation_profile,
    origin,
  } = c.req.valid("query");

  const params = new URLSearchParams({
    q,
    session_token,
    access_token: env.MAPBOX_ACCESS_TOKEN,
  });

  if (language) params.set("language", language);
  if (limit) params.set("limit", String(limit));
  if (proximity) params.set("proximity", proximity);
  if (bbox) params.set("bbox", bbox);
  if (country) params.set("country", country);
  if (types) params.set("types", types);
  if (poi_category) params.set("poi_category", poi_category);
  if (poi_category_exclusions) {
    params.set("poi_category_exclusions", poi_category_exclusions);
  }
  if (eta_type) params.set("eta_type", eta_type);
  if (navigation_profile) params.set("navigation_profile", navigation_profile);
  if (origin) params.set("origin", origin);

  const response = await fetch(
    `${env.MAPBOX_BASE_URL}/suggest?${params.toString()}`,
    {
      signal: AbortSignal.timeout(5000),
    },
  );

  if (!response.ok) {
    throw new HTTPException(response.status as ContentfulStatusCode, {
      message: INTERNAL_SERVER_ERROR.MESSAGE,
    });
  }

  const json = (await response.json()) as { suggestions: MapboxSuggestion[] };

  return c.json(json.suggestions, OK.CODE);
};

export const retrieve: AppRouteHandler<RetrieveRoute> = async (
  c: HandlerContext<RetrieveRoute>,
): HandlerReturn<RetrieveRoute> => {
  const { id } = c.req.valid("param");
  const {
    session_token,
    language,
    eta_type,
    navigation_profile,
    origin,
  } = c.req.valid("query");

  const params = new URLSearchParams({
    session_token,
    access_token: env.MAPBOX_ACCESS_TOKEN,
  });

  if (language) params.set("language", language);
  if (eta_type) params.set("eta_type", eta_type);
  if (navigation_profile) params.set("navigation_profile", navigation_profile);
  if (origin) params.set("origin", origin);

  const response = await fetch(
    `${env.MAPBOX_BASE_URL}/retrieve/${
      encodeURIComponent(id)
    }?${params.toString()}`,
    { signal: AbortSignal.timeout(5000) },
  );

  if (!response.ok) {
    throw new HTTPException(response.status as ContentfulStatusCode, {
      message: INTERNAL_SERVER_ERROR.MESSAGE,
    });
  }

  const json = (await response.json()) as {
    type: string;
    features: MapboxFeature[];
  };

  if (!json.features || json.features.length === 0) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  return c.json(json.features[0], OK.CODE);
};
