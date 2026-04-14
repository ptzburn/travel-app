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
import * as m from "~/paraglide/messages.js";

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
      <SidebarGroupLabel>{m.nav_locations()}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            as={A}
            href="/dashboard/locations/add"
            tooltip={m.nav_add_location()}
          >
            <PlusIcon />
            <span class="truncate">{m.nav_add_location()}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Suspense>
          <Show when={locations()} fallback={null}>
            {(locs) => (
              <For each={locs()}>
                {(loc) => (
                  <SidebarMenuItem
                    onMouseEnter={() => setHoveredSlug(loc.slug)}
                    onMouseLeave={() => setHoveredSlug(null)}
                  >
                    <SidebarMenuButton
                      as={A}
                      href={`/dashboard/locations/${loc.slug}`}
                      tooltip={loc.name}
                      isActive={isActive(loc.slug)}
                    >
                      <MapPinIcon />
                      <span class="truncate">{loc.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
