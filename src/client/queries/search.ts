import { rpcClient } from "~/shared/rpc-client.ts";
import type {
  MapboxFeature,
  MapboxSuggestion,
  RetrieveQuery,
  SuggestQuery,
} from "~/shared/types/search.ts";

export async function getSuggestionsQuery(
  params: SuggestQuery,
): Promise<MapboxSuggestion[]> {
  const response = await rpcClient.search.suggest.$get({
    query: params,
  });

  if (!response.ok) {
    const error = await response.json();
    if ("error" in error) {
      throw new Error(error.error.issues[0].message);
    }
    throw new Error(error.message);
  }

  return await response.json();
}

export async function getRetrieveQuery(
  params: RetrieveQuery & { id: string },
): Promise<MapboxFeature> {
  const response = await rpcClient.search.retrieve[":id"].$get({
    param: { id: params.id },
    query: { session_token: params.session_token },
  });

  if (!response.ok) {
    const error = await response.json();
    if ("error" in error) {
      throw new Error(error.error.issues[0].message);
    }
    throw new Error(error.message);
  }

  return await response.json();
}
