import { A, createAsync } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/client/components/ui/empty.tsx";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
} from "~/client/components/ui/pagination.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { TooltipButton } from "~/client/components/ui/tooltip-button.tsx";
import { getLocationsQuery } from "~/client/queries/locations.ts";
import {
  type LocationFilters,
  locationFilters,
  setLocationFilters,
} from "~/client/stores/location-filters.ts";
import { setMapMode } from "~/client/stores/map-store.ts";
import LucideCirclePlus from "~icons/lucide/circle-plus";
import MapPinIcon from "~icons/lucide/map-pin";
import PlusIcon from "~icons/lucide/plus";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  onCleanup,
  Show,
  Suspense,
  useTransition,
} from "solid-js";
import { LocationCard } from "./_components/location-card.tsx";
import { LocationSearch } from "./_components/location-search.tsx";

const ITEMS_PER_PAGE = 3;

export default function DashboardPage(): JSX.Element {
  const locations = createAsync(
    () => {
      const f = locationFilters();
      return getLocationsQuery({
        search: f.search || undefined,
        sortBy: f.sortBy,
        sortDirection: f.sortDirection,
      });
    },
    { initialValue: [] },
  );

  const [page, setPage] = createSignal(1);
  const totalPages = createMemo(() =>
    Math.max(1, Math.ceil(locations().length / ITEMS_PER_PAGE))
  );
  const paginatedLocations = createMemo(() => {
    const start = (page() - 1) * ITEMS_PER_PAGE;
    return locations().slice(start, start + ITEMS_PER_PAGE);
  });

  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (newFilters: LocationFilters) => {
    startTransition(() => {
      setLocationFilters(newFilters);
      setPage(1);
    });
  };

  createEffect(() => {
    setMapMode({
      mode: "view",
      locations: locations().map((loc) => ({
        ...loc,
        href: `/dashboard/locations/${loc.slug}`,
      })),
    });
  });

  onCleanup(() => setMapMode({ mode: "view", locations: [] }));

  return (
    <div class="flex min-h-0 flex-1 flex-col gap-6">
      <div class="flex items-center justify-between">
        <h2>Locations</h2>
        <TooltipButton
          tooltip="Add Location"
          size="icon-lg"
          variant="ghost"
          as={A}
          href="/dashboard/locations/add"
        >
          <LucideCirclePlus class="size-5" />
          <span class="sr-only">Add Location</span>
        </TooltipButton>
      </div>

      <LocationSearch onFilterChange={handleFilterChange} />

      <Suspense
        fallback={
          <div class="flex flex-1 items-center justify-center">
            <Spinner class="size-8" />
          </div>
        }
      >
        <Show when={locations()}>
          {(locs) => (
            <Show
              when={locs().length > 0}
              fallback={
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MapPinIcon />
                    </EmptyMedia>
                    <EmptyTitle>No locations yet</EmptyTitle>
                    <EmptyDescription>
                      Add your first location to see it on the map.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      as={A}
                      href="/dashboard/locations/add"
                      size="sm"
                      variant="outline"
                    >
                      <PlusIcon />
                      Add Location
                    </Button>
                  </EmptyContent>
                </Empty>
              }
            >
              <div
                class="flex min-h-0 flex-1 flex-col overflow-y-auto transition-opacity"
                classList={{ "opacity-50": isPending() }}
              >
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <For each={paginatedLocations()}>
                    {(loc) => <LocationCard location={loc} />}
                  </For>
                </div>
                <Show when={totalPages() > 1}>
                  <Pagination
                    count={totalPages()}
                    page={page()}
                    onPageChange={setPage}
                    itemComponent={(props) => (
                      <PaginationItem page={props.page}>
                        {props.page}
                      </PaginationItem>
                    )}
                    ellipsisComponent={() => <PaginationEllipsis />}
                    class="mt-auto pt-6 [&>*]:justify-center"
                  >
                    <PaginationPrevious />
                    <PaginationItems />
                    <PaginationNext />
                  </Pagination>
                </Show>
              </div>
            </Show>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
