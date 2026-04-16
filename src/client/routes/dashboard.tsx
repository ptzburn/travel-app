import {
  createAsync,
  type RouteSectionProps,
  useLocation,
} from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { ErrorBoundaryMessage } from "~/client/components/error-boundary-message.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { SessionProvider } from "~/client/contexts/session-context.tsx";
import { useMediaQuery } from "~/client/hooks/use-media-query.ts";
import { getSessionQuery } from "~/client/queries/auth.ts";
import {
  ErrorBoundary,
  type JSX,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar.tsx";
import { SearchPanel } from "./dashboard/_components/search-panel.tsx";

const Map = clientOnly(() =>
  import("~/client/routes/dashboard/_components/map.tsx")
);

const AppSidebar = clientOnly(() =>
  import("~/client/routes/dashboard/_components/app-sidebar.tsx")
);

const MobileHeader = clientOnly(() =>
  import("~/client/routes/dashboard/_components/mobile-header.tsx")
);

const MobileMapSheet = clientOnly(() =>
  import("~/client/routes/dashboard/_components/mobile-map-sheet.tsx")
);

export default function DashboardLayout(props: RouteSectionProps): JSX.Element {
  const session = createAsync(() => getSessionQuery());
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div class="flex min-h-0 flex-1 flex-col">
      <ErrorBoundary
        fallback={(error) => <ErrorBoundaryMessage error={error} />}
      >
        <Suspense
          fallback={
            <div class="flex flex-1 items-center justify-center">
              <Spinner class="size-10" />
            </div>
          }
        >
          <Show
            when={session()}
          >
            {(sessionData) => (
              <SessionProvider
                user={sessionData().user}
                session={sessionData().session}
              >
                <SidebarProvider style={{ "--sidebar-width": "12rem" }}>
                  <AppSidebar />
                  <SearchPanel />
                  <SidebarInset>
                    <MobileHeader />
                    <Switch>
                      <Match when={isMobile()}>
                        <div class="relative min-h-0 flex-1">
                          <div class="absolute inset-0">
                            <Map />
                          </div>
                          <MobileMapSheet>
                            {props.children}
                          </MobileMapSheet>
                        </div>
                      </Match>
                      <Match
                        when={location.pathname === "/dashboard" ||
                          location.pathname === "/dashboard/search"}
                      >
                        <div class="relative min-h-0 flex-1">
                          <div class="fixed inset-0 z-0">
                            <Map />
                          </div>
                        </div>
                      </Match>
                      <Match
                        when={location.pathname.startsWith(
                          "/dashboard/account",
                        )}
                      >
                        {props.children}
                      </Match>
                    </Switch>
                  </SidebarInset>
                </SidebarProvider>
              </SessionProvider>
            )}
          </Show>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
