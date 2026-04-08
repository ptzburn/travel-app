import { action } from "@solidjs/router";
import { rpcClient } from "~/shared/rpc-client.ts";
import type {
  CreateLocationInput,
  UpdateLocationInput,
} from "~/shared/types/locations.ts";

export const addLocationAction = action(
  async (locationData: CreateLocationInput) => {
    const response = await rpcClient.locations.$post({ json: locationData });

    if (!response.ok && response.status !== 422) {
      const json = await response.json();
      if ("message" in json) {
        throw new Error(json.message);
      }
      throw new Error("Unknown error");
    }

    return await response.json();
  },
  "addLocation",
);

export const updateLocationAction = action(
  async (slug: string, updates: UpdateLocationInput) => {
    const response = await rpcClient.locations[":slug"].$put({
      param: { slug },
      json: updates,
    });

    if (!response.ok && response.status !== 422) {
      const json = await response.json();
      if ("message" in json) {
        throw new Error(json.message);
      }
      throw new Error("Unknown error");
    }

    return await response.json();
  },
  "updateLocation",
);

export const deleteLocationAction = action(
  async (slug: string) => {
    const response = await rpcClient.locations[":slug"].$delete({
      param: { slug },
    });

    if (!response.ok) {
      const error = await response.json();
      if ("message" in error) {
        throw new Error(error.message, { cause: response.status });
      }
      if ("errors" in error) {
        const errorMessages = error.error.issues.map((e) => e.message)
          .flat().join(", ");
        throw new Error(errorMessages, { cause: response.status });
      }
      throw new Error("Unknown error");
    }

    return;
  },
  "deleteLocation",
);
