import { A, createAsync, useLocation } from "@solidjs/router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/client/components/ui/sidebar.tsx";
import { getLocationsQuery } from "~/client/queries/locations.ts";
import { hoveredSlug, setHoveredSlug } from "~/client/stores/location-hover.ts";
import { setMapMode } from "~/client/stores/map-store.ts";

import * as m from "~/paraglide/messages.js";
import MapPinIcon from "~icons/lucide/map-pin";
import {
  createEffect,
  For,
  type JSX,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";

export function LocationsNav(): JSX.Element {
  const locations = createAsync(() => getLocationsQuery(), {
    initialValue: [],
  });
  const location = useLocation();

  const isActive = (slug: string): boolean =>
    hoveredSlug() === slug ||
    location.pathname === `/dashboard/locations/${slug}`;

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
    <SidebarGroup>
      <SidebarGroupLabel>{m.nav_locations()}</SidebarGroupLabel>
      <SidebarMenu>
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
