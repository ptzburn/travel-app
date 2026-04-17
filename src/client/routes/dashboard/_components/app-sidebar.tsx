import { A, useLocation, useParams } from "@solidjs/router";
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
import { LocationLogsNav } from "~/client/routes/dashboard/_components/location-logs-nav.tsx";
import * as m from "~/paraglide/messages.js";
import LucideSearch from "~icons/lucide/search";
import { createEffect, type JSX, on, Show } from "solid-js";
import { LocationsNav } from "./locations-nav.tsx";
import { NavUser } from "./nav-user.tsx";

export function AppSidebar(): JSX.Element {
  const sidebar = useSidebar();
  const location = useLocation();
  const params = useParams();

  createEffect(
    on(() => location.pathname, () => {
      sidebar.setOpenMobile(false);
    }, { defer: true }),
  );

  const activeSection = (): string => {
    if (location.pathname.startsWith("/dashboard/account")) return "account";
    if (location.pathname === "/dashboard/users") return "admin";
    if (location.pathname === "/dashboard/search") return "search";
    return "locations";
  };

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
          <Show
            when={location.pathname === "/dashboard" ||
              location.pathname === "/dashboard/search"}
          >
            <LocationsNav />
          </Show>
          <Show when={params.slug}>
            {(slug) => <LocationLogsNav slug={slug()} />}
          </Show>
        </SidebarContent>
        <SidebarFooter class="mb-2">
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

export default AppSidebar;
