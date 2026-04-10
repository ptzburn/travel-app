import { revalidate, useAction, useNavigate } from "@solidjs/router";
import { revalidateLogic } from "@tanstack/solid-form";
import {
  addLocationAction,
  updateLocationAction,
} from "~/client/actions/locations.ts";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { getLocationsQuery } from "~/client/queries/locations.ts";
import { getLocationBySlugQuery } from "~/client/queries/locations.ts";
import * as m from "~/paraglide/messages.js";
import { type Accessor, type JSX, Show } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";
import { CoordinatesInstruction } from "./coordinates-instruction.tsx";

export type LocationFormHandle = {
  setName: (name: string) => void;
  getName: () => string;
  setCoordinates: (lat: number, long: number) => void;
  isDirty: () => boolean;
};

type LocationFormProps = {
  location?: {
    slug: string;
    name: string;
    description: string | null;
    lat: number;
    long: number;
  };
  pickedLat: Accessor<number | null>;
  pickedLong: Accessor<number | null>;
  hasCoordinates: Accessor<boolean>;
  onFormReady?: (handle: LocationFormHandle) => void;
};

export function LocationForm(props: LocationFormProps): JSX.Element {
  const navigate = useNavigate();
  const addAction = useAction(addLocationAction);
  const updateAction = useAction(updateLocationAction);

  const isEdit = !!props.location;

  const form = useAppForm(() => ({
    defaultValues: {
      name: props.location?.name ?? "",
      description: (props.location?.description ?? "") as string | null,
      lat: props.location?.lat ?? (props.pickedLat() ?? 0),
      long: props.location?.long ?? (props.pickedLong() ?? 0),
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({
        name: z.string().min(1, m.locations_name_required()).max(100),
        description: z.string().max(1000).or(z.null()),
        lat: z.number().min(-90).max(90),
        long: z.number().min(-180).max(180),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        const data = {
          ...value,
          description: value.description || null,
        };
        if (props.location) {
          await updateAction(props.location.slug, data);
          await revalidate(getLocationBySlugQuery.key);
          toast.success(m.locations_updated());
        } else {
          await addAction(data);
          toast.success(m.locations_added());
        }
        await revalidate(getLocationsQuery.key);
        form.reset();
        navigate("/dashboard");
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
            label={m.locations_name_label()}
            placeholder={m.locations_name_placeholder()}
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            label={m.locations_description_label()}
            placeholder={m.locations_description_placeholder()}
            rows={3}
          />
        )}
      </form.AppField>

      <Show when={props.hasCoordinates()}>
        <p class="text-muted-foreground text-sm tabular-nums">
          {m.locations_current_coordinates()} {props.pickedLat()?.toFixed(6)},
          {" "}
          {props.pickedLong()?.toFixed(6)}
        </p>
      </Show>

      <form.AppForm>
        <form.SubmitButton disabled={!props.hasCoordinates()}>
          {isEdit ? m.locations_save_changes() : m.locations_add()}
        </form.SubmitButton>
      </form.AppForm>
    </form>
  );
}
