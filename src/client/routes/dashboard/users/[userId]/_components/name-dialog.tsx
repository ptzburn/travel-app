import { revalidate } from "@solidjs/router";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import { getUserByIdQuery } from "~/client/queries/users.ts";
import * as m from "~/paraglide/messages.js";
import type { SelectUser } from "~/shared/types/auth.ts";
import type { Accessor, JSX, Setter } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

type NameDialogProps = {
  user: Accessor<SelectUser>;
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [firstName = "", ...rest] = parts;
  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export function NameDialog(props: NameDialogProps): JSX.Element {
  const form = useAppForm(() => ({
    defaultValues: splitName(props.user().name),
    validators: {
      onSubmit: z.object({
        firstName: z.string().trim().min(1),
        lastName: z.string().trim().min(1),
      }),
    },
    onSubmit: async ({ formApi, value }) => {
      const fullName = [value.firstName.trim(), value.lastName.trim()]
        .filter(Boolean)
        .join(" ");

      await authClient.admin.updateUser(
        {
          userId: props.user().id,
          data: { name: fullName },
        },
        {
          onSuccess: () => {
            formApi.reset();
            revalidate(getUserByIdQuery.keyFor(props.user().id));
            props.setIsOpen(false);
            toast.success(m.users_name_updated());
          },
          onError: (error) => {
            toast.error(error.error.message || m.users_name_update_failed());
          },
        },
      );
    },
  }));

  return (
    <ResponsiveEditDialog
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
      title={m.users_edit_name()}
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
                  label={m.users_first_name()}
                  placeholder={m.users_first_name()}
                />
              )}
            </form.AppField>
            <form.AppField name="lastName">
              {(field) => (
                <field.TextField
                  label={m.users_last_name()}
                  placeholder={m.users_last_name()}
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
  );
}
