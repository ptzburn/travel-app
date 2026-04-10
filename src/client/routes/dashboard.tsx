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
import { ErrorBoundary, type JSX, Show, Suspense } from "solid-js";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar.tsx";

const AppSidebar = clientOnly(() =>
  import("../routes/dashboard/_components/app-sidebar.tsx")
);
const MobileHeader = clientOnly(() =>
  import("../routes/dashboard/_components/mobile-header.tsx")
);
const MobileMapSheet = clientOnly(() =>
  import("~/client/routes/dashboard/_components/mobile-map-sheet.tsx")
);
const Map = clientOnly(() =>
  import("~/client/routes/dashboard/_components/map.tsx")
);

const locationEditPattern = /^\/dashboard\/locations\/[^/]+\/edit$/;
const locationDetailPattern = /^\/dashboard\/locations\/[^/]+$/;
const locationLogAddPattern = /^\/dashboard\/locations\/[^/]+\/add$/;
const locationLogDetailPattern = /^\/dashboard\/locations\/[^/]+\/\d+$/;
const locationLogEditPattern = /^\/dashboard\/locations\/[^/]+\/[^/]+\/edit$/;

export function isLocationRoute(path: string, slug?: string): boolean {
  const locationRoutes = new Set([
    "/dashboard",
    "/dashboard/locations/add",
  ]);
  if (slug) {
    locationRoutes.add(`/dashboard/locations/${slug}/edit`);
  }
  return locationRoutes.has(path);
}

export function isLocationLogsRoute(path: string, slug?: string): boolean {
  const locationLogsRoutes = new Set<string>([]);
  if (slug) {
    locationLogsRoutes.add(`/dashboard/locations/${slug}`);
    locationLogsRoutes.add(`/dashboard/locations/${slug}/add`);
  }
  return locationLogsRoutes.has(path) ||
    locationLogEditPattern.test(path);
}

function showsMap(path: string): boolean {
  return path === "/dashboard" ||
    path === "/dashboard/locations/add" ||
    locationEditPattern.test(path) ||
    locationDetailPattern.test(path) ||
    locationLogDetailPattern.test(path) ||
    locationLogAddPattern.test(path) ||
    locationLogEditPattern.test(path);
}

function isEditRoute(path: string): boolean {
  return path === "/dashboard/locations/add" ||
    locationEditPattern.test(path) ||
    locationLogAddPattern.test(path) ||
    locationLogEditPattern.test(path);
}

export default function DashboardLayout(props: RouteSectionProps): JSX.Element {
  const session = createAsync(() => getSessionQuery());
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const showMobileMap = (): boolean =>
    isMobile() && showsMap(location.pathname);

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
                    <Show
                      when={showMobileMap()}
                      fallback={
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
                                  : "min-h-[300px] flex-1 md:min-h-[400px] md:flex-[1.5]"
                              }`}
                            >
                              <Map />
                            </div>
                          </Show>
                        </main>
                      }
                    >
                      <div class="relative min-h-0 flex-1">
                        <div class="absolute inset-0">
                          <Map />
                        </div>
                        <MobileMapSheet
                          isEditRoute={isEditRoute(location.pathname)}
                        >
                          {props.children}
                        </MobileMapSheet>
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
