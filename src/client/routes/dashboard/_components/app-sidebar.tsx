import { A, useLocation, useParams } from "@solidjs/router";
import { Collapsible } from "~/client/components/ui/collapsible.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "~/client/components/ui/sidebar.tsx";
import { useSession } from "~/client/contexts/session-context.tsx";
import {
  isLocationLogsRoute,
  isLocationRoute,
} from "~/client/routes/dashboard.tsx";
import { AccountNav } from "~/client/routes/dashboard/_components/account-nav.tsx";
import * as m from "~/paraglide/messages.js";
import ChevronLeftIcon from "~icons/lucide/chevron-left";
import ChevronRightIcon from "~icons/lucide/chevron-right";

import UsersIcon from "~icons/lucide/users";
import { createEffect, type JSX, Match, on, Show } from "solid-js";
import { Switch } from "solid-js";
import { LocationLogsNav } from "./location-logs-nav.tsx";
import { LocationsNav } from "./locations-nav.tsx";
import { NavMain } from "./nav-main.tsx";
import { NavUser } from "./nav-user.tsx";

export function AppSidebar(): JSX.Element {
  const sidebar = useSidebar();
  const location = useLocation();
  const params = useParams();
  const session = useSession();

  createEffect(
    on(() => location.pathname, () => {
      sidebar.setOpenMobile(false);
    }, { defer: true }),
  );

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      side={sidebar.isMobile() ? "right" : "left"}
    >
      <SidebarHeader class="my-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <A href="/dashboard">
              <SidebarMenuButton size="lg" tooltip="Carte">
                <img
                  src="/icon.png"
                  alt="Carte"
                  class="size-8 rounded-lg"
                />
                <span class="truncate font-semibold text-lg">Carte</span>
              </SidebarMenuButton>
            </A>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <Switch>
          <Match when={isLocationRoute(location.pathname, params.slug)}>
            <LocationsNav />
          </Match>
          <Match
            when={isLocationLogsRoute(location.pathname, params.slug) &&
              params.slug}
          >
            {(slug) => <LocationLogsNav slug={slug()} />}
          </Match>
        </Switch>
        <Show when={location.pathname.startsWith("/dashboard/account")}>
          <AccountNav />
        </Show>
        <SidebarGroup>
          <SidebarGroupLabel>{m.nav_admin()}</SidebarGroupLabel>
          <SidebarMenu>
            <Show when={session.user.role === "admin"}>
              <Collapsible>
                <A href="/dashboard/users">
                  <SidebarMenuItem
                    class={"/dashboard/users" === location.pathname
                      ? "bg-accent rounded"
                      : ""}
                  >
                    <SidebarMenuButton tooltip={m.nav_users()}>
                      <UsersIcon />
                      <span>{m.nav_users()}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </A>
              </Collapsible>
            </Show>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarTrigger
          class={`hidden w-full md:flex ${
            sidebar.state() === "expanded" ? "justify-end" : "justify-center"
          }`}
        >
          <Show
            when={sidebar.state() === "expanded"}
            fallback={<ChevronRightIcon class="size-4" />}
          >
            <ChevronLeftIcon class="size-4" />
          </Show>
        </SidebarTrigger>
        <Separator />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
