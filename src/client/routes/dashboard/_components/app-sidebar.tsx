import { A, useLocation, useMatch } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "~/client/components/ui/sidebar.tsx";
import {
  type LocationFilters,
  setLocationFilters,
} from "~/client/stores/location-filters.ts";
import * as m from "~/paraglide/messages.js";
import LucideCirclePlus from "~icons/lucide/circle-plus";
import LucideSearch from "~icons/lucide/search";
import LucideX from "~icons/lucide/x";
import { createEffect, type JSX, on, Show, useTransition } from "solid-js";
import { LocationSearch } from "./location-search.tsx";
import { LocationsNav } from "./locations-nav.tsx";
import { NavUser } from "./nav-user.tsx";

export function AppSidebar(): JSX.Element {
  const sidebar = useSidebar();
  const location = useLocation();

  const notAdd = (s: string): boolean => s !== "add";
  const matchLocationDetail = useMatch(() => "/dashboard/locations/:slug", {
    slug: notAdd,
  });
  const matchLocationEdit = useMatch(() => "/dashboard/locations/:slug/edit", {
    slug: notAdd,
  });
  const matchLogAdd = useMatch(() => "/dashboard/locations/:slug/add", {
    slug: notAdd,
  });
  const matchLogEdit = useMatch(() => "/dashboard/locations/:slug/:id/edit", {
    slug: notAdd,
    id: /^\d+$/,
  });

  const isSearchRoute = (): boolean =>
    location.pathname === "/dashboard/search";

  const isLocationRoute = (): boolean =>
    isSearchRoute() ||
    location.pathname === "/dashboard/locations/add" ||
    Boolean(matchLocationEdit());

  const locationLogsSlug = (): string | undefined =>
    matchLocationDetail()?.params.slug ||
    matchLogAdd()?.params.slug ||
    matchLogEdit()?.params.slug;

  const isAccountRoute = (): boolean =>
    location.pathname.startsWith("/dashboard/account");

  createEffect(
    on(() => location.pathname, () => {
      sidebar.setOpenMobile(false);
    }, { defer: true }),
  );

  const [_isPending, startTransition] = useTransition();

  const handleFilterChange = (newFilters: LocationFilters) => {
    startTransition(() => setLocationFilters(newFilters));
  };

  const activeSection = (): string => {
    if (isAccountRoute()) return "account";
    if (location.pathname === "/dashboard/users") return "admin";
    if (isSearchRoute()) return "search";
    return "locations";
  };

  const showContentPanel = (): boolean => location.pathname !== "/dashboard";

  const panelTitle = (): string => {
    if (isSearchRoute()) return m.nav_search();
    if (locationLogsSlug()) return m.nav_location_logs();
    if (isAccountRoute()) return m.nav_account_settings();
    return m.locations_title();
  };

  const contentPanelLeft = (): string =>
    sidebar.state() === "expanded"
      ? "var(--sidebar-width)"
      : "var(--sidebar-width-icon)";

  return (
    <>
      <Sidebar
        collapsible="icon"
        side={sidebar.isMobile() ? "right" : "left"}
        class="group-data-[side=left]:border-r"
      >
        <SidebarHeader class="mt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <div class="flex items-center justify-between">
                <A
                  href="/dashboard"
                  class="flex flex-row items-center justify-center gap-2 group-data-[collapsible=icon]:hidden"
                >
                  <img
                    src="/icon.png"
                    alt="Carte"
                    class="size-8 rounded-full"
                  />
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">Carte</span>
                  </div>
                </A>
                <SidebarTrigger />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <Show when={sidebar.state() === "collapsed"}>
          <SidebarSeparator />
        </Show>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent class="px-1.5 md:px-0">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    as={A}
                    href="/dashboard/search"
                    tooltip={m.nav_search()}
                    isActive={activeSection() === "search"}
                    class="px-2.5 md:px-2"
                  >
                    <LucideSearch />
                    <span>{m.nav_search()}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <LocationsNav />
        </SidebarContent>
        <SidebarFooter class="mb-2">
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* Content panel — fixed, anchored to the sidebar's right edge */}
      <Show when={showContentPanel()}>
        <div
          class="fixed inset-y-0 z-10 hidden w-[17rem] flex-col border-r bg-sidebar text-sidebar-foreground transition-[left] duration-200 ease-linear md:flex"
          style={{ left: contentPanelLeft() }}
        >
          <SidebarHeader class="gap-3.5 border-b p-4">
            <div class="flex w-full items-center justify-between">
              <div class="font-medium text-base text-foreground">
                {panelTitle()}
              </div>
              <div class="flex items-center gap-1">
                <Show when={isLocationRoute()}>
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
                </Show>
                <Show when={isSearchRoute()}>
                  <Button
                    as={A}
                    href="/dashboard"
                    size="icon-sm"
                    variant="ghost"
                    class="size-7"
                  >
                    <LucideX class="size-4" />
                    <span class="sr-only">{m.common_close()}</span>
                  </Button>
                </Show>
              </div>
            </div>
            <Show when={isLocationRoute()}>
              <LocationSearch onFilterChange={handleFilterChange} />
            </Show>
          </SidebarHeader>
        </div>
      </Show>
    </>
  );
}

export default AppSidebar;
