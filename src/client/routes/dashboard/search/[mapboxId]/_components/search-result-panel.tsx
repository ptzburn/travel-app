import { A } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import { SidebarHeader, useSidebar } from "~/client/components/ui/sidebar.tsx";
import { SearchResultContent } from "~/client/routes/dashboard/search/[mapboxId]/_components/search-result-content.tsx";
import * as m from "~/paraglide/messages.js";
import ArrowLeft from "~icons/lucide/arrow-left";
import type { JSX } from "solid-js";

export function SearchResultPanel(props: { mapboxId: string }): JSX.Element {
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
          <div class="flex items-center gap-2">
            <Button
              as={A}
              href="/dashboard/search"
              size="icon-sm"
              variant="ghost"
              class="size-7"
              aria-label={m.search_result_back()}
            >
              <ArrowLeft class="size-4" />
            </Button>
            <div class="font-medium text-base text-foreground">
              {m.search_result_title()}
            </div>
          </div>
        </div>
      </SidebarHeader>
      <div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        <SearchResultContent mapboxId={props.mapboxId} />
      </div>
    </div>
  );
}

export default SearchResultPanel;
