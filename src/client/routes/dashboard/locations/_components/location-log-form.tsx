import { revalidate, useAction, useNavigate } from "@solidjs/router";
import { revalidateLogic } from "@tanstack/solid-form";
import {
  addLocationLogAction,
  updateLocationLogAction,
} from "~/client/actions/location-logs.ts";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { getLocationBySlugQuery } from "~/client/queries/locations.ts";
import * as m from "~/paraglide/messages.js";
import { haversineDistance, MAX_LOG_RADIUS_KM } from "~/shared/utils/geo.ts";
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
  parentLat: number;
  parentLong: number;
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
      lat: props.locationLog?.lat ?? (props.pickedLat() ?? 0),
      long: props.locationLog?.long ?? (props.pickedLong() ?? 0),
      startedAt: props.locationLog?.startedAt ?? "",
      endedAt: props.locationLog?.endedAt ?? "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({
        name: z.string().min(1, m.logs_name_required()).max(100),
        description: z.string().max(1000).or(z.null()),
        lat: z.number().min(-90).max(90),
        long: z.number().min(-180).max(180),
        startedAt: z.string().min(1, m.logs_start_date_required()),
        endedAt: z.string().min(1, m.logs_end_date_required()),
      }).refine(
        (v) => !v.startedAt || !v.endedAt || v.startedAt <= v.endedAt,
        { message: m.logs_start_before_end(), path: ["startedAt"] },
      ).refine(
        (v) =>
          haversineDistance(v.lat, v.long, props.parentLat, props.parentLong) <=
            MAX_LOG_RADIUS_KM,
        {
          message: m.logs_within_radius({ radius: String(MAX_LOG_RADIUS_KM) }),
          path: ["lat"],
        },
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
          toast.success(m.logs_updated());
        } else {
          await addAction(data, props.slug);
          toast.success(m.logs_added());
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
        {(field) => (
          <field.TextField
            label={m.logs_name_label()}
            placeholder={m.logs_name_placeholder()}
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            label={m.logs_description_label()}
            placeholder={m.logs_description_placeholder()}
            rows={3}
          />
        )}
      </form.AppField>

      <div class="grid gap-4 sm:grid-cols-2">
        <form.AppField name="startedAt">
          {(field) => (
            <field.DatePicker
              label={m.logs_start_date_label()}
              placeholder={m.logs_start_date_placeholder()}
            />
          )}
        </form.AppField>

        <form.AppField name="endedAt">
          {(field) => (
            <field.DatePicker
              label={m.logs_end_date_label()}
              placeholder={m.logs_end_date_placeholder()}
            />
          )}
        </form.AppField>
      </div>

      <Show when={props.hasCoordinates()}>
        <p class="text-muted-foreground text-sm tabular-nums">
          {m.locations_current_coordinates()} {props.pickedLat()?.toFixed(6)},
          {" "}
          {props.pickedLong()?.toFixed(6)}
        </p>
      </Show>

      <form.AppForm>
        <form.SubmitButton disabled={!props.hasCoordinates()}>
          {isEdit ? m.logs_save_changes() : m.logs_add_short()}
        </form.SubmitButton>
      </form.AppForm>
    </form>
  );
}
