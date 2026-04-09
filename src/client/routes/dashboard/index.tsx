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
import { setMapMode } from "~/client/stores/map-store.ts";
import MapPinIcon from "~icons/lucide/map-pin";
import PlusIcon from "~icons/lucide/plus";
import {
  createEffect,
  For,
  type JSX,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import { LocationCard } from "./_components/location-card.tsx";

export default function DashboardPage(): JSX.Element {
  const locations = createAsync(() => getLocationsQuery(), {
    initialValue: [],
  });

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
        <Button as={A} href="/dashboard/locations/add" size="sm">
          <PlusIcon />
          Add Location
        </Button>
      </div>

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
                <Empty class="border">
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
                    <Button as={A} href="/dashboard/locations/add" size="sm">
                      <PlusIcon />
                      Add Location
                    </Button>
                  </EmptyContent>
                </Empty>
              }
            >
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <For each={locs()}>
                  {(loc) => <LocationCard location={loc} />}
                </For>
              </div>
            </Show>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
