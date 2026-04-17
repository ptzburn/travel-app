import { revalidate, useAction, useNavigate } from "@solidjs/router";
import { revalidateLogic } from "@tanstack/solid-form";
import { addLocationAction } from "~/client/actions/locations.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/client/components/ui/dialog.tsx";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/client/components/ui/drawer.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { useMediaQuery } from "~/client/hooks/use-media-query.ts";
import { getLocationsQuery } from "~/client/queries/locations.ts";
import * as m from "~/paraglide/messages.js";
import type { MapboxFeature } from "~/shared/types/search.ts";
import { type Accessor, type JSX, type Setter, Show } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

type AddFromSearchDialogProps = {
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
  feature: MapboxFeature;
};

export function AddFromSearchDialog(
  props: AddFromSearchDialogProps,
): JSX.Element {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();
  const addAction = useAction(addLocationAction);

  const [long, lat] = props.feature.geometry.coordinates;

  const form = useAppForm(() => ({
    defaultValues: {
      name: props.feature.properties.name ?? "",
      description: "" as string | null,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({
        name: z.string().min(1, m.locations_name_required()).max(100),
        description: z.string().max(1000).or(z.null()),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        const data = {
          name: value.name,
          description: value.description || null,
          lat,
          long,
        };
        const result = await addAction(data);
        await revalidate(getLocationsQuery.key);
        toast.success(m.locations_added());
        form.reset();
        props.setIsOpen(false);
        if (
          result && typeof result === "object" && "slug" in result &&
          typeof result.slug === "string"
        ) {
          navigate(`/dashboard/locations/${result.slug}`);
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    },
  }));

  const FormBody = (): JSX.Element => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      class="flex flex-col gap-4"
    >
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

      <form.AppForm>
        <form.SubmitButton>
          {m.locations_add()}
        </form.SubmitButton>
      </form.AppForm>
    </form>
  );

  return (
    <Show
      when={isDesktop()}
      fallback={
        <Drawer open={props.isOpen()} onOpenChange={props.setIsOpen}>
          <DrawerContent>
            <DrawerHeader class="text-left">
              <DrawerTitle>{m.search_add_dialog_title()}</DrawerTitle>
              <DrawerDescription>
                {m.search_add_dialog_description()}
              </DrawerDescription>
            </DrawerHeader>
            <div class="px-4 pb-6">
              <FormBody />
            </div>
          </DrawerContent>
        </Drawer>
      }
    >
      <Dialog open={props.isOpen()} onOpenChange={props.setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.search_add_dialog_title()}</DialogTitle>
            <DialogDescription>
              {m.search_add_dialog_description()}
            </DialogDescription>
          </DialogHeader>
          <FormBody />
        </DialogContent>
      </Dialog>
    </Show>
  );
}

export default AddFromSearchDialog;
