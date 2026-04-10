import { A, createAsync, useLocation } from "@solidjs/router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/client/components/ui/sidebar.tsx";
import { getLocationBySlugQuery } from "~/client/queries/locations.ts";
import { hoveredSlug, setHoveredSlug } from "~/client/stores/location-hover.ts";
import {
  filterAndSortLogs,
  locationLogFilters,
} from "~/client/stores/location-log-filters.ts";
import NotebookPen from "~icons/lucide/notebook-pen";
import PlusIcon from "~icons/lucide/plus";
import { createMemo, For, type JSX, Show, Suspense } from "solid-js";

export function LocationLogsNav(props: { slug: string }): JSX.Element {
  const location = createAsync(() => getLocationBySlugQuery(props.slug));
  const currentLocation = useLocation();

  const filteredLogs = createMemo(() =>
    filterAndSortLogs(
      location()?.locationLogs ?? [],
      locationLogFilters(),
    )
  );

  const isActive = (logId: number): boolean =>
    hoveredSlug() === `log-${logId}` ||
    currentLocation.pathname ===
      `/dashboard/locations/${props.slug}/${logId}`;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Location Logs</SidebarGroupLabel>
      <SidebarMenu>
        <A href={`/dashboard/locations/${props.slug}/add`}>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Add Location Log">
              <PlusIcon />
              <span class="truncate">Add Location Log</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </A>
        <Suspense>
          <Show when={filteredLogs().length > 0}>
            <For each={filteredLogs()}>
              {(log) => {
                const logSlug = `log-${log.id}`;
                return (
                  <A
                    href={`/dashboard/locations/${props.slug}/${log.id}`}
                  >
                    <SidebarMenuItem
                      onMouseEnter={() => setHoveredSlug(logSlug)}
                      onMouseLeave={() => setHoveredSlug(null)}
                    >
                      <SidebarMenuButton
                        tooltip={log.name}
                        isActive={isActive(log.id)}
                      >
                        <NotebookPen />
                        <span class="truncate">{log.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </A>
                );
              }}
            </For>
          </Show>
        </Suspense>
      </SidebarMenu>
    </SidebarGroup>
  );
}
