import { A, useLocation } from "@solidjs/router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/client/components/ui/sidebar.tsx";
import * as m from "~/paraglide/messages.js";
import Database from "~icons/lucide/database";
import GlobeLock from "~icons/lucide/globe-lock";
import Shield from "~icons/lucide/shield";
import User from "~icons/lucide/user";
import { For, type JSX } from "solid-js";

const getNavItems = () => [
  {
    label: m.nav_account(),
    icon: User,
    href: "/dashboard/account",
  },
  {
    label: m.nav_data(),
    icon: Database,
    href: "/dashboard/account/data",
  },
  {
    label: m.nav_security(),
    icon: Shield,
    href: "/dashboard/account/security",
  },
  {
    label: m.nav_sessions(),
    icon: GlobeLock,
    href: "/dashboard/account/sessions",
  },
];

export function AccountNav(): JSX.Element {
  const location = useLocation();

  const isActive = (href: string) => {
    const normalizedPath = location.pathname.endsWith("/")
      ? location.pathname.slice(0, -1)
      : location.pathname;
    return normalizedPath === href;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{m.nav_account_settings()}</SidebarGroupLabel>
      <SidebarMenu>
        <For
          each={getNavItems()}
        >
          {(item) => (
            <SidebarMenuItem>
              <SidebarMenuButton
                as={A}
                href={item.href}
                isActive={isActive(item.href)}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </For>
      </SidebarMenu>
    </SidebarGroup>
  );
}
