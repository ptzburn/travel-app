import { createAsync, useBeforeLeave } from "@solidjs/router";
import { ConfirmationDialog } from "~/client/components/confirmation-dialog.tsx";
import { getLocationsQuery } from "~/client/queries/locations.ts";
import {
  LocationForm,
  type LocationFormHandle,
} from "~/client/routes/dashboard/locations/_components/location-form.tsx";
import {
  LocationSearch,
  type SearchResult,
} from "~/client/routes/dashboard/locations/_components/location-search.tsx";
import { setMapMode } from "~/client/stores/map-store.ts";
import * as m from "~/paraglide/messages.js";
import { createEffect, createSignal, type JSX, onCleanup } from "solid-js";

export default function AddLocationPage(): JSX.Element {
  const locations = createAsync(() => getLocationsQuery(), {
    initialValue: [],
  });
  const [pickedLat, setPickedLat] = createSignal<number | null>(64.0);
  const [pickedLong, setPickedLong] = createSignal<number | null>(26.0);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = createSignal(false);
  const [pendingNavigation, setPendingNavigation] = createSignal<
    (() => void) | null
  >(null);

  let formHandle: LocationFormHandle | undefined;

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
      zoom: 5,
      locations: locations().map((loc) => ({
        ...loc,
        href: `/dashboard/locations/${loc.slug}`,
      })),
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
        <h2>{m.locations_add_title()}</h2>

        <div class="flex flex-col gap-4">
          <LocationSearch onSelect={handleSearchSelect} />
          <LocationForm
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
        title={m.locations_leave_title()}
        description={m.locations_leave_description()}
        confirmText={m.locations_leave_confirm()}
        cancelText={m.locations_leave_cancel()}
      />
    </>
  );
}
