import { A, createAsync, useLocation } from "@solidjs/router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/client/components/ui/sidebar.tsx";
import { getLocationsQuery } from "~/client/queries/locations.ts";
import { locationFilters } from "~/client/stores/location-filters.ts";
import { hoveredSlug, setHoveredSlug } from "~/client/stores/location-hover.ts";

import MapPinIcon from "~icons/lucide/map-pin";
import PlusIcon from "~icons/lucide/plus";
import { For, type JSX, Show, Suspense } from "solid-js";

export function LocationsNav(): JSX.Element {
  const locations = createAsync(() => {
    const f = locationFilters();
    return getLocationsQuery({
      search: f.search || undefined,
      sortBy: f.sortBy,
      sortDirection: f.sortDirection,
    });
  });
  const location = useLocation();

  const isActive = (slug: string): boolean =>
    hoveredSlug() === slug ||
    location.pathname === `/dashboard/locations/${slug}`;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Locations</SidebarGroupLabel>
      <SidebarMenu>
        <A href="/dashboard/locations/add">
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Add Location">
              <PlusIcon />
              <span class="truncate">Add Location</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </A>
        <Suspense>
          <Show when={locations()} fallback={null}>
            {(locs) => (
              <For each={locs()}>
                {(loc) => (
                  <A href={`/dashboard/locations/${loc.slug}`}>
                    <SidebarMenuItem
                      onMouseEnter={() => setHoveredSlug(loc.slug)}
                      onMouseLeave={() => setHoveredSlug(null)}
                    >
                      <SidebarMenuButton
                        tooltip={loc.name}
                        isActive={isActive(loc.slug)}
                      >
                        <MapPinIcon />
                        <span class="truncate">{loc.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </A>
                )}
              </For>
            )}
          </Show>
        </Suspense>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default LocationsNav;
