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
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { getLocationsQuery } from "~/client/queries/locations.ts";
import {
  type LocationFilters,
  locationFilters,
  setLocationFilters,
} from "~/client/stores/location-filters.ts";
import { setMapMode } from "~/client/stores/map-store.ts";
import * as m from "~/paraglide/messages.js";
import LucideCirclePlus from "~icons/lucide/circle-plus";
import MapPinIcon from "~icons/lucide/map-pin";
import PlusIcon from "~icons/lucide/plus";
import {
  createEffect,
  For,
  type JSX,
  onCleanup,
  Show,
  Suspense,
  useTransition,
} from "solid-js";
import { LocationCard } from "./_components/location-card.tsx";
import { LocationSearch } from "./_components/location-search.tsx";

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

  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (newFilters: LocationFilters) => {
    startTransition(() => {
      setLocationFilters(newFilters);
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
    <div class="pointer-events-auto flex h-full max-h-full w-[380px] flex-col py-2 pr-2 md:hidden">
      <div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-l-none rounded-r-lg border border-l-0 border-sidebar-border/50 bg-background/70 shadow-lg backdrop-blur-xl">
        <div class="flex items-center justify-between border-b px-4 pt-3 pb-3">
          <h2 class="font-semibold text-base">{m.locations_title()}</h2>
          <Button
            as={A}
            href="/dashboard/locations/add"
            size="icon-sm"
            variant="ghost"
            class="size-7"
          >
            <LucideCirclePlus class="size-4" />
            <span class="sr-only">{m.locations_add()}</span>
          </Button>
        </div>

        <div class="border-b px-4 py-3">
          <LocationSearch onFilterChange={handleFilterChange} />
        </div>

        <Suspense
          fallback={
            <div class="flex flex-1 items-center justify-center py-8">
              <Spinner class="size-6" />
            </div>
          }
        >
          <Show when={locations()}>
            {(locs) => (
              <Show
                when={locs().length > 0}
                fallback={
                  <Empty class="py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <MapPinIcon />
                      </EmptyMedia>
                      <EmptyTitle>{m.locations_empty_title()}</EmptyTitle>
                      <EmptyDescription>
                        {m.locations_empty_description()}
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
                        {m.locations_add()}
                      </Button>
                    </EmptyContent>
                  </Empty>
                }
              >
                <div
                  class="flex min-h-0 flex-1 flex-col overflow-y-auto transition-opacity"
                  classList={{ "opacity-50": isPending() }}
                >
                  <div class="flex flex-col">
                    <For each={locations()}>
                      {(loc) => <LocationCard location={loc} />}
                    </For>
                  </div>
                </div>
              </Show>
            )}
          </Show>
        </Suspense>
      </div>
    </div>
  );
}
