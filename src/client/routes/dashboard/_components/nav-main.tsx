import { A, useLocation } from "@solidjs/router";
import { Collapsible } from "~/client/components/ui/collapsible.tsx";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/client/components/ui/sidebar.tsx";
import * as m from "~/paraglide/messages.js";
import ArrowLeftIcon from "~icons/lucide/arrow-left";
import { type JSX, Show } from "solid-js";

const nonRoutableSegments = new Set(["/dashboard/locations"]);

function getBackUrl(pathname: string): string | null {
  if (pathname === "/dashboard") return null;
  const segments = pathname.replace(/\/$/, "").split("/");
  segments.pop();
  let parent = segments.join("/") || "/dashboard";
  if (nonRoutableSegments.has(parent)) parent = "/dashboard";
  return parent;
}

export function NavMain(): JSX.Element {
  const location = useLocation();

  const backUrl = () => getBackUrl(location.pathname);

  return (
    <Show when={backUrl()}>
      {(url) => (
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible>
              <A href={url()}>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={m.nav_back()}>
                    <ArrowLeftIcon />
                    <span>{m.nav_back()}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </A>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      )}
    </Show>
  );
}
