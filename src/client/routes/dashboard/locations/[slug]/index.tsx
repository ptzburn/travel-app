import { A, createAsync, useParams } from "@solidjs/router";
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
import { getLocationBySlugQuery } from "~/client/queries/locations.ts";
import { LocationLogCard } from "~/client/routes/dashboard/locations/_components/location-log-card.tsx";
import { setMapMode } from "~/client/stores/map-store.ts";
import NotebookPen from "~icons/lucide/notebook-pen";
import PlusIcon from "~icons/lucide/plus";
import {
  createEffect,
  For,
  type JSX,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";

export default function LocationDetailPage(): JSX.Element {
  const params = useParams<{ slug: string }>();
  const location = createAsync(() => getLocationBySlugQuery(params.slug));

  createEffect(() => {
    const loc = location();
    if (!loc) return;

    if (loc.locationLogs.length > 0) {
      setMapMode({
        mode: "view",
        locations: loc.locationLogs.map((log) => ({
          id: log.id,
          name: log.name,
          slug: `log-${log.id}`,
          description: log.description,
          lat: log.lat,
          long: log.long,
          href: `/dashboard/locations/${params.slug}/${log.id}`,
        })),
      });
    } else {
      setMapMode({
        mode: "view",
        locations: [{
          id: loc.id,
          name: loc.name,
          slug: loc.slug,
          description: loc.description,
          lat: loc.lat,
          long: loc.long,
          href: `/dashboard/locations/${loc.slug}`,
        }],
      });
    }
  });

  onCleanup(() => setMapMode({ mode: "view", locations: [] }));

  return (
    <div class="flex min-h-0 flex-1 flex-col gap-6">
      <Suspense
        fallback={
          <div class="flex flex-1 items-center justify-center">
            <Spinner class="size-8" />
          </div>
        }
      >
        <Show when={location()}>
          {(loc) => (
            <>
              <div class="flex shrink-0 items-center justify-between">
                <h2>Location Logs</h2>
                <Button
                  as={A}
                  href={`/dashboard/locations/${loc().slug}/add`}
                  variant="outline"
                  size="sm"
                >
                  <PlusIcon class="size-4" />
                  Add Log
                </Button>
              </div>
              <Show
                when={loc().locationLogs.length > 0}
                fallback={
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <NotebookPen />
                      </EmptyMedia>
                      <EmptyTitle>No logs yet</EmptyTitle>
                      <EmptyDescription>
                        Location logs will appear here once added.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button
                        as={A}
                        href={`/dashboard/locations/${loc().slug}/add`}
                        size="sm"
                        variant="outline"
                      >
                        <PlusIcon />
                        Add Log
                      </Button>
                    </EmptyContent>
                  </Empty>
                }
              >
                <div class="min-h-0 flex-1 overflow-auto">
                  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <For each={loc().locationLogs}>
                      {(log) => <LocationLogCard slug={loc().slug} log={log} />}
                    </For>
                  </div>
                </div>
              </Show>
            </>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
