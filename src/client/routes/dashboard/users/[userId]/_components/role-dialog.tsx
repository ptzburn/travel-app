import { revalidate } from "@solidjs/router";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { FieldGroup } from "~/client/components/ui/field.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";

import { authClient } from "~/client/lib/auth-client.ts";

import { getUserByIdQuery } from "~/client/queries/users.ts";
import * as m from "~/paraglide/messages.js";
import type { SelectUser } from "~/shared/types/auth.ts";
import { createEffect, createMemo } from "solid-js";
import type { Accessor, JSX } from "solid-js";
import { toast } from "solid-sonner";

const getRoleOptions = () => [
  { value: "user", label: m.users_role_user() },
  { value: "admin", label: m.users_role_admin() },
];

type RoleDialogProps = {
  user: Accessor<SelectUser>;
  isOpen: Accessor<boolean>;
  setIsOpen: (open: boolean) => void;
};

export function RoleDialog(props: RoleDialogProps): JSX.Element {
  const roleOptions = createMemo(() => getRoleOptions());

  const form = useAppForm(() => ({
    defaultValues: {
      role: props.user().role ?? "user",
    },
    validators: {},
    onSubmit: async ({ value }) => {
      await authClient.admin.setRole(
        {
          userId: String(props.user().id),
          role: value.role,
        },
        {
          onSuccess: () => {
            revalidate(getUserByIdQuery.keyFor(props.user().id));
            props.setIsOpen(false);
            toast.success(m.users_role_updated());
          },
          onError: (error) => {
            toast.error(error.error?.message ?? m.users_role_update_failed());
          },
        },
      );
    },
  }));

  createEffect(() => {
    if (props.isOpen()) {
      form.reset({
        role: props.user().role ?? "user",
      });
    }
  });

  return (
    <ResponsiveEditDialog
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
      title={m.users_change_role()}
      description={m.users_change_role_description()}
    >
      {() => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          class="space-y-4 py-2"
        >
          <FieldGroup>
            <form.AppField name="role">
              {(field) => (
                <field.SelectField
                  label={m.users_role_label()}
                  placeholder={m.users_role_placeholder()}
                  options={roleOptions()}
                />
              )}
            </form.AppField>
          </FieldGroup>
          <form.AppForm>
            <form.SubmitButton>{m.common_save()}</form.SubmitButton>
          </form.AppForm>
        </form>
      )}
    </ResponsiveEditDialog>
  );
}
