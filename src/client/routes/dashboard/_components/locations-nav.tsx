import { A, createAsync } from "@solidjs/router";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/client/components/ui/sidebar.tsx";
import { getLocationsQuery } from "~/client/queries/locations.ts";
import { hoveredSlug, setHoveredSlug } from "~/client/stores/location-hover.ts";

import MapPinIcon from "~icons/lucide/map-pin";
import PlusIcon from "~icons/lucide/plus";
import { For, type JSX, Show, Suspense } from "solid-js";

export function LocationsNav(): JSX.Element {
  const locations = createAsync(() => getLocationsQuery());

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Locations
        <SidebarGroupAction as={A} href="/dashboard/locations/add">
          <PlusIcon />
          <span class="sr-only">Add Location</span>
        </SidebarGroupAction>
      </SidebarGroupLabel>
      <Suspense>
        <Show when={locations()} fallback={null}>
          {(locs) => (
            <SidebarMenu>
              <For each={locs()}>
                {(loc) => (
                  <SidebarMenuItem
                    onMouseEnter={() => setHoveredSlug(loc.slug)}
                    onMouseLeave={() => setHoveredSlug(null)}
                  >
                    <SidebarMenuButton
                      tooltip={loc.name}
                      isActive={hoveredSlug() === loc.slug}
                    >
                      <MapPinIcon />
                      <span class="truncate">{loc.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </For>
            </SidebarMenu>
          )}
        </Show>
      </Suspense>
    </SidebarGroup>
  );
}

export default LocationsNav;
