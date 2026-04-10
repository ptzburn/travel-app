import { createAsync, useBeforeLeave, useParams } from "@solidjs/router";
import { ConfirmationDialog } from "~/client/components/confirmation-dialog.tsx";
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
import { haversineDistance, MAX_LOG_RADIUS_KM } from "~/shared/utils/geo.ts";
import { createEffect, createSignal, type JSX, onCleanup } from "solid-js";
import { toast } from "solid-sonner";

export default function AddLocationLogPage(): JSX.Element {
  const params = useParams<{ slug: string }>();
  const parentLocation = createAsync(() => getLocationBySlugQuery(params.slug));
  const [pickedLat, setPickedLat] = createSignal<number | null>(null);
  const [pickedLong, setPickedLong] = createSignal<number | null>(null);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = createSignal(false);
  const [pendingNavigation, setPendingNavigation] = createSignal<
    (() => void) | null
  >(null);

  let formHandle: LocationLogFormHandle | undefined;

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
      toast.error(
        `Location must be within ${MAX_LOG_RADIUS_KM} km of the parent location`,
      );
      return;
    }
    setPickedLat(lat);
    setPickedLong(long);
    formHandle?.setCoordinates(lat, long);
  };

  createEffect(() => {
    const parent = parentLocation();
    if (parent && pickedLat() === null) {
      setPickedLat(parent.lat);
      setPickedLong(parent.long);
      formHandle?.setCoordinates(parent.lat, parent.long);
    }
  });

  createEffect(() => {
    const parent = parentLocation();
    const logs = parent?.locationLogs ?? [];
    setMapMode({
      mode: "pick",
      lat: pickedLat(),
      long: pickedLong(),
      onPick: handlePick,
      zoom: 12,
      locations: logs.map((log) => ({
        id: log.id,
        name: log.name,
        slug: `log-${log.id}`,
        description: log.description,
        lat: log.lat,
        long: log.long,
        href: `/dashboard/locations/${params.slug}/${log.id}`,
      })),
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
        `Selected location is too far from the parent (${distance} km away, max ${MAX_LOG_RADIUS_KM} km)`,
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
        <div class="flex items-center gap-3">
          <h2>Add Location Log</h2>
        </div>

        <div class="flex flex-col gap-4">
          <LocationSearch onSelect={handleSearchSelect} />
          <LocationLogForm
            slug={params.slug}
            parentLat={parentLocation()?.lat ?? 0}
            parentLong={parentLocation()?.long ?? 0}
            pickedLat={pickedLat}
            pickedLong={pickedLong}
            hasCoordinates={hasCoordinates}
            onFormReady={(handle) => {
              formHandle = handle;
            }}
          />
        </div>
      </div>

      <ConfirmationDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        onConfirm={() => {
          const retry = pendingNavigation();
          if (retry) retry();
        }}
        title="Are you sure you want to leave?"
        description="All unsaved changes will be lost."
        confirmText="Leave"
        cancelText="Stay"
      />
    </>
  );
}
