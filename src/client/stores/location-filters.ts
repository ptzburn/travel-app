import { createSignal } from "solid-js";

export type LocationFilters = {
  search: string;
};

export const defaultLocationFilters: LocationFilters = {
  search: "",
};

const [locationFilters, setLocationFilters] = createSignal<LocationFilters>(
  defaultLocationFilters,
);

export { locationFilters, setLocationFilters };
