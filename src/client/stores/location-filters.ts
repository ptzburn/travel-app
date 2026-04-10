import { createSignal } from "solid-js";

export type LocationFilters = {
  search: string;
  sortBy: "name" | "createdAt" | "updatedAt";
  sortDirection: "asc" | "desc";
};

export const defaultLocationFilters: LocationFilters = {
  search: "",
  sortBy: "createdAt",
  sortDirection: "desc",
};

const [locationFilters, setLocationFilters] = createSignal<LocationFilters>(
  defaultLocationFilters,
);

export { locationFilters, setLocationFilters };
