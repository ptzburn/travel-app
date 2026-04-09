import { createAsync, useBeforeLeave, useParams } from "@solidjs/router";
import { ConfirmationDialog } from "~/client/components/confirmation-dialog.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { getLocationBySlugQuery } from "~/client/queries/locations.ts";
import {
  LocationForm,
  type LocationFormHandle,
} from "~/client/routes/dashboard/locations/_components/location-form.tsx";
import {
  LocationSearch,
  type SearchResult,
} from "~/client/routes/dashboard/locations/_components/location-search.tsx";
import { setMapMode } from "~/client/stores/map-store.ts";
import {
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";

export default function EditLocationPage(): JSX.Element {
  const params = useParams<{ slug: string }>();
  const location = createAsync(() => getLocationBySlugQuery(params.slug));

  const [pickedLat, setPickedLat] = createSignal<number | null>(null);
  const [pickedLong, setPickedLong] = createSignal<number | null>(null);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = createSignal(false);
  const [pendingNavigation, setPendingNavigation] = createSignal<
    (() => void) | null
  >(null);

  let formHandle: LocationFormHandle | undefined;

  createEffect(() => {
    const loc = location();
    if (loc && pickedLat() === null) {
      setPickedLat(loc.lat);
      setPickedLong(loc.long);
    }
  });

  const handlePick = (lat: number, long: number): void => {
    setPickedLat(lat);
    setPickedLong(long);
    formHandle?.setCoordinates(lat, long);
  };

  createEffect(() => {
    setMapMode({
      mode: "pick",
      lat: pickedLat(),
      long: pickedLong(),
      onPick: handlePick,
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
    handlePick(result.lat, result.long);
    if (!formHandle?.getName()) {
      formHandle?.setName(result.name || result.displayName);
    }
  };

  return (
    <>
      <div class="flex min-h-0 flex-1 flex-col gap-6">
        <h2>Edit Location</h2>

        <div class="flex flex-col gap-4">
          <LocationSearch onSelect={handleSearchSelect} />
          <Suspense
            fallback={
              <div class="flex items-center justify-center py-8">
                <Spinner class="size-6" />
              </div>
            }
          >
            <Show when={location()}>
              {(loc) => (
                <LocationForm
                  location={loc()}
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
        title="Are you sure you want to leave?"
        description="All unsaved changes will be lost."
        confirmText="Leave"
        cancelText="Stay"
      />
    </>
  );
}
