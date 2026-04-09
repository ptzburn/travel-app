import { A, useBeforeLeave } from "@solidjs/router";
import { ConfirmationDialog } from "~/client/components/confirmation-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  LocationForm,
  type LocationFormHandle,
} from "~/client/routes/dashboard/locations/_components/location-form.tsx";
import {
  LocationSearch,
  type SearchResult,
} from "~/client/routes/dashboard/locations/_components/location-search.tsx";
import { setMapMode } from "~/client/stores/map-store.ts";

import ArrowLeftIcon from "~icons/lucide/arrow-left";
import { createEffect, createSignal, type JSX, onCleanup } from "solid-js";

export default function AddLocationPage(): JSX.Element {
  const [pickedLat, setPickedLat] = createSignal<number | null>(null);
  const [pickedLong, setPickedLong] = createSignal<number | null>(null);
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
        <div class="flex items-center gap-3">
          <Button
            as={A}
            href="/dashboard"
            variant="ghost"
            size="icon"
          >
            <ArrowLeftIcon />
          </Button>
          <h1>Add Location</h1>
        </div>

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
        title="Are you sure you want to leave?"
        description="All unsaved changes will be lost."
        confirmText="Leave"
        cancelText="Stay"
      />
    </>
  );
}
