import {
  createAsync,
  type RouteSectionProps,
  useLocation,
} from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { ErrorBoundaryMessage } from "~/client/components/error-boundary-message.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { SessionProvider } from "~/client/contexts/session-context.tsx";
import { getSessionQuery } from "~/client/queries/auth.ts";
import { ErrorBoundary, type JSX, Show, Suspense } from "solid-js";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar.tsx";

const AppSidebar = clientOnly(() =>
  import("../routes/dashboard/_components/app-sidebar.tsx")
);
const MobileHeader = clientOnly(() =>
  import("../routes/dashboard/_components/mobile-header.tsx")
);
const Map = clientOnly(() =>
  import("~/client/routes/dashboard/_components/map.tsx")
);

const locationEditPattern = /^\/dashboard\/locations\/[^/]+\/edit$/;

function showsMap(path: string): boolean {
  return path === "/dashboard" ||
    path === "/dashboard/locations/add" ||
    locationEditPattern.test(path);
}

function isEditRoute(path: string): boolean {
  return path === "/dashboard/locations/add" ||
    locationEditPattern.test(path);
}

export default function DashboardLayout(props: RouteSectionProps): JSX.Element {
  const session = createAsync(() => getSessionQuery());
  const location = useLocation();

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
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset class="flex flex-1 flex-col overflow-hidden">
                    <MobileHeader />
                    <main
                      class={`container flex min-h-0 flex-1 gap-6 py-4 pb-20 md:py-8 md:pb-8 ${
                        isEditRoute(location.pathname)
                          ? "flex-col lg:flex-row"
                          : "flex-col"
                      }`}
                    >
                      <div class="flex min-h-0 flex-1 flex-col">
                        {props.children}
                      </div>
                      <Show when={showsMap(location.pathname)}>
                        <div
                          class={`relative overflow-hidden rounded-lg border ${
                            isEditRoute(location.pathname)
                              ? "min-h-[300px] lg:min-h-0 lg:flex-1"
                              : "min-h-[300px] flex-1 md:min-h-[400px]"
                          }`}
                        >
                          <Map />
                        </div>
                      </Show>
                    </main>
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
