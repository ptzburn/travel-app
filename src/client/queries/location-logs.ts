import { query } from "@solidjs/router";
import { rpcClient } from "~/shared/rpc-client.ts";

export const getLocationLogByIdQuery = query(
  async (slug: string, id: string) => {
    const response = await rpcClient.locations[":slug"][":id"].$get({
      param: { slug, id },
    });

    if (!response.ok) {
      const error = await response.json();

      if ("error" in error) {
        const messages = error.error.issues.map((e) => e.message).join(", ");
        throw new Error(messages, { cause: response.status });
      }

      throw new Error(error.message, { cause: response.status });
    }

    return await response.json();
  },
  "locationLog",
);
