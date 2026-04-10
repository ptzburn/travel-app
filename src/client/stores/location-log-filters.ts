import { createSignal } from "solid-js";

export type LocationLogFilters = {
  search: string;
  sortBy: "name" | "startedAt" | "endedAt" | "createdAt" | "updatedAt";
  sortDirection: "asc" | "desc";
};

export const defaultLocationLogFilters: LocationLogFilters = {
  search: "",
  sortBy: "startedAt",
  sortDirection: "desc",
};

const [locationLogFilters, setLocationLogFilters] = createSignal<
  LocationLogFilters
>(defaultLocationLogFilters);

export { locationLogFilters, setLocationLogFilters };

type SortableLog = Record<LocationLogFilters["sortBy"], unknown> & {
  name: string;
  description: string | null;
};

export function filterAndSortLogs<T extends SortableLog>(
  logs: readonly T[],
  filters: LocationLogFilters,
): T[] {
  let result: T[] = [...logs];

  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (log) =>
        log.name.toLowerCase().includes(term) ||
        log.description?.toLowerCase().includes(term),
    );
  }

  result.sort((a, b) => {
    const aVal = a[filters.sortBy];
    const bVal = b[filters.sortBy];
    const dir = filters.sortDirection === "asc" ? 1 : -1;
    if (typeof aVal === "string" && typeof bVal === "string") {
      return dir * aVal.localeCompare(bVal);
    }
    return dir * (Number(aVal) - Number(bVal));
  });

  return result;
}
