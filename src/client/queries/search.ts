import { query } from "@solidjs/router";
import { rpcClient } from "~/shared/rpc-client.ts";
import type { SearchQuery } from "~/shared/types/search.ts";

export const getSearchResultsQuery = query(async (query: SearchQuery) => {
  const response = await rpcClient.search.$get({
    query,
  });

  if (!response.ok) {
    const error = await response.json();
    if ("error" in error) {
      throw new Error(error.error.issues[0].message);
    }
    throw new Error(error.message);
  }

  return await response.json();
}, "search");
