import { useLocation, useParams } from "@solidjs/router";
import { Separator } from "~/client/components/ui/separator.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "~/client/components/ui/sidebar.tsx";
import {
  isLocationLogsRoute,
  isLocationRoute,
} from "~/client/routes/dashboard.tsx";
import { AccountNav } from "~/client/routes/dashboard/_components/account-nav.tsx";
import ChevronLeftIcon from "~icons/lucide/chevron-left";
import ChevronRightIcon from "~icons/lucide/chevron-right";
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
        <NavUser />
        <Separator />
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
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
