import { revalidate, useAction, useNavigate } from "@solidjs/router";
import { revalidateLogic } from "@tanstack/solid-form";
import {
  addLocationLogAction,
  updateLocationLogAction,
} from "~/client/actions/location-logs.ts";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { getLocationBySlugQuery } from "~/client/queries/locations.ts";
import { type Accessor, type JSX, Show } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";
import { CoordinatesInstruction } from "./coordinates-instruction.tsx";

export type LocationLogFormHandle = {
  setName: (name: string) => void;
  getName: () => string;
  setCoordinates: (lat: number, long: number) => void;
  isDirty: () => boolean;
};

type LocationLogFormProps = {
  slug: string;
  locationLog?: {
    id: number;
    name: string;
    description: string | null;
    lat: number;
    long: number;
    startedAt: string;
    endedAt: string;
  };
  pickedLat: Accessor<number | null>;
  pickedLong: Accessor<number | null>;
  hasCoordinates: Accessor<boolean>;
  onFormReady?: (handle: LocationLogFormHandle) => void;
};

export function LocationLogForm(props: LocationLogFormProps): JSX.Element {
  const navigate = useNavigate();
  const addAction = useAction(addLocationLogAction);
  const updateAction = useAction(updateLocationLogAction);

  const isEdit = !!props.locationLog;

  const form = useAppForm(() => ({
    defaultValues: {
      name: props.locationLog?.name ?? "",
      description: (props.locationLog?.description ?? "") as string | null,
      lat: props.locationLog?.lat ?? 0,
      long: props.locationLog?.long ?? 0,
      startedAt: props.locationLog?.startedAt ?? "",
      endedAt: props.locationLog?.endedAt ?? "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({
        name: z.string().min(1, "Name is required").max(100),
        description: z.string().max(1000).or(z.null()),
        lat: z.number().min(-90).max(90),
        long: z.number().min(-180).max(180),
        startedAt: z.string().min(1, "Start date is required"),
        endedAt: z.string().min(1, "End date is required"),
      }).refine(
        (v) => !v.startedAt || !v.endedAt || v.startedAt <= v.endedAt,
        { message: "Start date must be before end date", path: ["startedAt"] },
      ),
    },
    onSubmit: async ({ value }) => {
      try {
        const data = {
          ...value,
          description: value.description || null,
        };
        if (props.locationLog) {
          await updateAction(
            props.slug,
            String(props.locationLog.id),
            data,
          );
          toast.success("Log updated");
        } else {
          await addAction(data, props.slug);
          toast.success("Log added");
        }
        await revalidate(getLocationBySlugQuery.key);
        form.reset();
        navigate(`/dashboard/locations/${props.slug}`);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    },
  }));

  props.onFormReady?.({
    setName: (name) => form.setFieldValue("name", name),
    getName: () => form.getFieldValue("name"),
    setCoordinates: (lat, long) => {
      form.setFieldValue("lat", Math.round(lat * 1e6) / 1e6);
      form.setFieldValue("long", Math.round(long * 1e6) / 1e6);
    },
    isDirty: () => form.state.isDirty,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      class="flex flex-col gap-4"
    >
      <CoordinatesInstruction />

      <form.AppField name="name">
        {(field) => <field.TextField label="Name" placeholder="Log name" />}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            label="Description"
            placeholder="Optional description"
            rows={3}
          />
        )}
      </form.AppField>

      <div class="grid gap-4 sm:grid-cols-2">
        <form.AppField name="startedAt">
          {(field) => (
            <field.DatePicker
              label="Start Date"
              placeholder="Select start date"
            />
          )}
        </form.AppField>

        <form.AppField name="endedAt">
          {(field) => (
            <field.DatePicker label="End Date" placeholder="Select end date" />
          )}
        </form.AppField>
      </div>

      <Show when={props.hasCoordinates()}>
        <p class="text-muted-foreground text-sm tabular-nums">
          Current coordinates: {props.pickedLat()?.toFixed(6)},{" "}
          {props.pickedLong()?.toFixed(6)}
        </p>
      </Show>

      <form.AppForm>
        <form.SubmitButton disabled={!props.hasCoordinates()}>
          {isEdit ? "Save Changes" : "Add Log"}
        </form.SubmitButton>
      </form.AppForm>
    </form>
  );
}
