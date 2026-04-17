import { A } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import { SidebarHeader, useSidebar } from "~/client/components/ui/sidebar.tsx";
import * as m from "~/paraglide/messages.js";
import LucideX from "~icons/lucide/x";
import type { JSX } from "solid-js";

export function LocationPanel(_props: { slug: string }): JSX.Element {
  const sidebar = useSidebar();

  const contentPanelLeft = (): string =>
    sidebar.state() === "expanded"
      ? "var(--sidebar-width)"
      : "var(--sidebar-width-icon)";

  return (
    <div
      class="fixed inset-y-0 z-10 hidden w-[17rem] flex-col border-r bg-sidebar text-sidebar-foreground transition-[left] duration-200 ease-linear md:flex"
      style={{ left: contentPanelLeft() }}
    >
      <SidebarHeader class="gap-3.5 border-b p-4">
        <div class="flex w-full items-center justify-between">
          <div class="font-medium text-base text-foreground">
            {m.locations_info_title()}
          </div>
          <div class="flex items-center gap-1">
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
          </div>
        </div>
      </SidebarHeader>
      <div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        {/* TODO: Add location detail */}
      </div>
    </div>
  );
}

export default LocationPanel;
