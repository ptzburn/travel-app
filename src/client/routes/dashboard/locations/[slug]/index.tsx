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
import { getLocationBySlugQuery } from "~/client/queries/locations.ts";
import { LocationLogCard } from "~/client/routes/dashboard/locations/_components/location-log-card.tsx";
import { LocationLogSearch } from "~/client/routes/dashboard/locations/_components/location-log-search.tsx";
import {
  filterAndSortLogs,
  type LocationLogFilters,
  locationLogFilters,
  setLocationLogFilters,
} from "~/client/stores/location-log-filters.ts";
import { setMapMode } from "~/client/stores/map-store.ts";
import LucideCirclePlus from "~icons/lucide/circle-plus";
import NotebookPen from "~icons/lucide/notebook-pen";
import PlusIcon from "~icons/lucide/plus";
import SearchIcon from "~icons/lucide/search";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";

const ITEMS_PER_PAGE = 3;

export default function LocationDetailPage(): JSX.Element {
  const params = useParams<{ slug: string }>();
  const location = createAsync(() => getLocationBySlugQuery(params.slug));
  const [page, setPage] = createSignal(1);

  const filteredLogs = createMemo(() =>
    filterAndSortLogs(
      location()?.locationLogs ?? [],
      locationLogFilters(),
    )
  );

  const totalPages = createMemo(() =>
    Math.max(1, Math.ceil(filteredLogs().length / ITEMS_PER_PAGE))
  );
  const paginatedLogs = createMemo(() => {
    const start = (page() - 1) * ITEMS_PER_PAGE;
    return filteredLogs().slice(start, start + ITEMS_PER_PAGE);
  });

  const handleFilterChange = (newFilters: LocationLogFilters) => {
    setLocationLogFilters(newFilters);
    setPage(1);
  };

  createEffect(() => {
    const loc = location();
    if (!loc) return;

    const visible = filteredLogs();
    if (visible.length > 0) {
      setMapMode({
        mode: "view",
        locations: visible.map((log) => ({
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
                <TooltipButton
                  tooltip="Add Location Log"
                  size="icon-lg"
                  variant="ghost"
                  as={A}
                  href={`/dashboard/locations/${loc().slug}/add`}
                >
                  <LucideCirclePlus class="size-5" />
                  <span class="sr-only">Add Location Log</span>
                </TooltipButton>
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
                <LocationLogSearch onFilterChange={handleFilterChange} />
                <Show
                  when={filteredLogs().length > 0}
                  fallback={
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <SearchIcon />
                        </EmptyMedia>
                        <EmptyTitle>No matching logs</EmptyTitle>
                        <EmptyDescription>
                          Try adjusting your search or filters.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  }
                >
                  <div class="flex min-h-0 flex-1 flex-col">
                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <For each={paginatedLogs()}>
                        {(log) => (
                          <LocationLogCard slug={loc().slug} log={log} />
                        )}
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
              </Show>
            </>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
