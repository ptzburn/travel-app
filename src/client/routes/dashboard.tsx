import {
  createAsync,
  type RouteSectionProps,
  useLocation,
  useParams,
} from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { ErrorBoundaryMessage } from "~/client/components/error-boundary-message.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { SessionProvider } from "~/client/contexts/session-context.tsx";
import { getSessionQuery } from "~/client/queries/auth.ts";
import LocationPanel from "~/client/routes/dashboard/locations/[slug]/_components/location-panel.tsx";
import { SearchPanel } from "~/client/routes/dashboard/search/_components/search-panel.tsx";
import SearchResultPanel from "~/client/routes/dashboard/search/[mapboxId]/_components/search-result-panel.tsx";
import { ErrorBoundary, type JSX, Show, Suspense } from "solid-js";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar.tsx";

const Map = clientOnly(() =>
  import("~/client/routes/dashboard/_components/map.tsx")
);

const AppSidebar = clientOnly(() =>
  import("~/client/routes/dashboard/_components/app-sidebar.tsx")
);

const MobileHeader = clientOnly(() =>
  import("~/client/routes/dashboard/_components/mobile-header.tsx")
);

export default function DashboardLayout(props: RouteSectionProps): JSX.Element {
  const session = createAsync(() => getSessionQuery());
  const location = useLocation();
  const params = useParams();

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
                  <Show when={params.slug}>
                    {(slug) => <LocationPanel slug={slug()} />}
                  </Show>
                  <Show when={params.mapboxId}>
                    {(mapboxId) => <SearchResultPanel mapboxId={mapboxId()} />}
                  </Show>
                  <SidebarInset>
                    <MobileHeader />
                    <Show
                      when={!location.pathname.startsWith(
                        "/dashboard/account",
                      )}
                      fallback={props.children}
                    >
                      <div class="relative min-h-0 flex-1">
                        <div class="fixed inset-0 z-0">
                          <Map />
                        </div>
                      </div>
                    </Show>
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
