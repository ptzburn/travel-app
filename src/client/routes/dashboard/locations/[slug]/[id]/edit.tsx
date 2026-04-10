import { createAsync, useBeforeLeave, useParams } from "@solidjs/router";
import { ConfirmationDialog } from "~/client/components/confirmation-dialog.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { getLocationLogByIdQuery } from "~/client/queries/location-logs.ts";
import { getLocationBySlugQuery } from "~/client/queries/locations.ts";
import {
  LocationLogForm,
  type LocationLogFormHandle,
} from "~/client/routes/dashboard/locations/_components/location-log-form.tsx";
import {
  LocationSearch,
  type SearchResult,
} from "~/client/routes/dashboard/locations/_components/location-search.tsx";
import { setMapMode } from "~/client/stores/map-store.ts";
import * as m from "~/paraglide/messages.js";
import { haversineDistance, MAX_LOG_RADIUS_KM } from "~/shared/utils/geo.ts";
import {
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import { toast } from "solid-sonner";

export default function EditLocationLogPage(): JSX.Element {
  const params = useParams<{ slug: string; id: string }>();
  const parentLocation = createAsync(() => getLocationBySlugQuery(params.slug));
  const locationLog = createAsync(() =>
    getLocationLogByIdQuery(params.slug, params.id)
  );

  const [pickedLat, setPickedLat] = createSignal<number | null>(null);
  const [pickedLong, setPickedLong] = createSignal<number | null>(null);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = createSignal(false);
  const [pendingNavigation, setPendingNavigation] = createSignal<
    (() => void) | null
  >(null);

  let formHandle: LocationLogFormHandle | undefined;

  createEffect(() => {
    const log = locationLog();
    if (log && pickedLat() === null) {
      setPickedLat(log.lat);
      setPickedLong(log.long);
    }
  });

  const isWithinRadius = (lat: number, long: number): boolean => {
    const parent = parentLocation();
    if (!parent) return true;
    return (
      haversineDistance(lat, long, parent.lat, parent.long) <=
        MAX_LOG_RADIUS_KM
    );
  };

  const handlePick = (lat: number, long: number): void => {
    if (!isWithinRadius(lat, long)) {
      toast.error(m.logs_too_far({ radius: String(MAX_LOG_RADIUS_KM) }));
      return;
    }
    setPickedLat(lat);
    setPickedLong(long);
    formHandle?.setCoordinates(lat, long);
  };

  createEffect(() => {
    const parent = parentLocation();
    setMapMode({
      mode: "pick",
      lat: pickedLat(),
      long: pickedLong(),
      onPick: handlePick,
      ...(parent && {
        radiusCenter: { lat: parent.lat, long: parent.long },
        radiusKm: MAX_LOG_RADIUS_KM,
      }),
    });
  });

  onCleanup(() => setMapMode({ mode: "view", locations: [] }));

  useBeforeLeave((e) => {
    if (formHandle?.isDirty() && !e.defaultPrevented) {
      e.preventDefault();
      setPendingNavigation(() => () => e.retry(true));
      setIsLeaveDialogOpen(true);
    }
  });

  const hasCoordinates = (): boolean =>
    pickedLat() !== null && pickedLong() !== null;

  const handleSearchSelect = (result: SearchResult): void => {
    if (!isWithinRadius(result.lat, result.long)) {
      const parent = parentLocation();
      const distance = parent
        ? Math.round(
          haversineDistance(result.lat, result.long, parent.lat, parent.long),
        )
        : 0;
      toast.error(
        m.logs_too_far_distance({
          distance: String(distance),
          radius: String(MAX_LOG_RADIUS_KM),
        }),
      );
      return;
    }
    handlePick(result.lat, result.long);
    if (!formHandle?.getName()) {
      formHandle?.setName(result.name || result.displayName);
    }
  };

  return (
    <>
      <div class="flex min-h-0 flex-1 flex-col gap-6">
        <h2>{m.logs_edit_title()}</h2>

        <div class="flex flex-col gap-4">
          <LocationSearch onSelect={handleSearchSelect} />
          <Suspense
            fallback={
              <div class="flex items-center justify-center py-8">
                <Spinner class="size-6" />
              </div>
            }
          >
            <Show when={locationLog()}>
              {(log) => (
                <LocationLogForm
                  slug={params.slug}
                  parentLat={parentLocation()?.lat ?? 0}
                  parentLong={parentLocation()?.long ?? 0}
                  locationLog={log()}
                  pickedLat={pickedLat}
                  pickedLong={pickedLong}
                  hasCoordinates={hasCoordinates}
                  onFormReady={(handle) => {
                    formHandle = handle;
                  }}
                />
              )}
            </Show>
          </Suspense>
        </div>
      </div>

      <ConfirmationDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        onConfirm={() => {
          const retry = pendingNavigation();
          if (retry) retry();
        }}
        title={m.locations_leave_title()}
        description={m.locations_leave_description()}
        confirmText={m.locations_leave_confirm()}
        cancelText={m.locations_leave_cancel()}
      />
    </>
  );
}
