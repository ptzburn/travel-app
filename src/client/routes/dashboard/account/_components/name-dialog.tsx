import { revalidate } from "@solidjs/router";
import { revalidateLogic } from "@tanstack/solid-form";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import { getSessionQuery } from "~/client/queries/auth.ts";
import * as m from "~/paraglide/messages.js";
import { createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

type NameEditDialogProps = {
  currentName: string;
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [firstName = "", ...rest] = parts;
  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export function NameEditDialog(props: NameEditDialogProps): JSX.Element {
  const [open, setOpen] = createSignal(false);

  const form = useAppForm(() => ({
    defaultValues: splitName(props.currentName),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({
        firstName: z.string().trim().min(1),
        lastName: z.string().trim().min(1),
      }),
    },
    onSubmit: async ({ formApi, value }) => {
      const fullName = [value.firstName.trim(), value.lastName.trim()]
        .filter(Boolean)
        .join(" ");

      await authClient.updateUser(
        {
          name: fullName,
        },
        {
          onSuccess: () => {
            formApi.reset();
            setOpen(false);
            revalidate(getSessionQuery.key);
            toast.success(m.account_name_updated());
          },
          onError: (error) => {
            toast.error(error.error.message || m.account_name_update_failed());
          },
        },
      );
    },
  }));

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        {m.account_edit_name()}
      </Button>

      <ResponsiveEditDialog
        isOpen={open}
        setIsOpen={setOpen}
        title={m.account_edit_name()}
      >
        {() => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            class="space-y-4"
          >
            <div class="grid gap-4 md:grid-cols-2">
              <form.AppField name="firstName">
                {(field) => (
                  <field.TextField
                    label={m.account_first_name()}
                    placeholder={m.account_first_name()}
                  />
                )}
              </form.AppField>
              <form.AppField name="lastName">
                {(field) => (
                  <field.TextField
                    label={m.account_last_name()}
                    placeholder={m.account_last_name()}
                  />
                )}
              </form.AppField>
            </div>
            <form.AppForm>
              <form.SubmitButton>{m.common_save()}</form.SubmitButton>
            </form.AppForm>
          </form>
        )}
      </ResponsiveEditDialog>
    </>
  );
}
