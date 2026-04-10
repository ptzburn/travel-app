import { query } from "@solidjs/router";
import { rpcClient } from "~/shared/rpc-client.ts";
import type { LocationQueryParams } from "~/shared/types/locations.ts";

export const getLocationsQuery = query(
  async (params?: LocationQueryParams) => {
    const response = await rpcClient.locations.$get({
      query: params ?? {},
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  },
  "locations",
);

export const getLocationBySlugQuery = query(async (slug: string) => {
  const response = await rpcClient.locations[":slug"].$get({
    param: { slug },
  });

  if (!response.ok) {
    const error = await response.json();
    if ("error" in error) {
      throw new Error(error.error.issues[0].message);
    }
    throw new Error(error.message);
  }

  return await response.json();
}, "location");
