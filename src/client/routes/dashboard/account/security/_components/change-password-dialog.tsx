import { revalidateLogic } from "@tanstack/solid-form";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";

import { authClient } from "~/client/lib/auth-client.ts";
import * as m from "~/paraglide/messages.js";
import { createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

export function ChangePasswordDialog(): JSX.Element {
  const [open, setOpen] = createSignal(false);

  const form = useAppForm(() => ({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z
        .object({
          currentPassword: z.string().min(1),
          newPassword: z.string().min(
            8,
            m.security_password_min_length(),
          ),
          confirmPassword: z.string().min(
            8,
            m.security_password_min_length(),
          ),
        })
        .superRefine((data, ctx) => {
          if (data.newPassword !== data.confirmPassword) {
            ctx.addIssue({
              code: "custom",
              message: m.auth_passwords_no_match(),
              path: ["newPassword"],
            });
            ctx.addIssue({
              code: "custom",
              message: m.auth_passwords_no_match(),
              path: ["confirmPassword"],
            });
          }
        }),
    },
    onSubmit: async ({ formApi, value }) => {
      await authClient.changePassword(
        {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true,
        },
        {
          onSuccess: () => {
            formApi.reset();
            setOpen(false);
            toast.success(m.security_password_changed());
          },
          onError: (error) => {
            toast.error(
              error.error.message || m.security_password_change_failed(),
            );
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
        {m.security_change_password()}
      </Button>

      <ResponsiveEditDialog
        isOpen={open}
        setIsOpen={setOpen}
        title={m.security_change_password()}
        description={m.security_change_password_description()}
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
            <form.AppField name="currentPassword">
              {(field) => (
                <field.TextField
                  label={m.security_current_password_label()}
                  type="password"
                  placeholder={m.security_current_password_placeholder()}
                />
              )}
            </form.AppField>
            <form.AppField name="newPassword">
              {(field) => (
                <field.TextField
                  label={m.security_new_password_label()}
                  type="password"
                  placeholder={m.security_new_password_placeholder()}
                />
              )}
            </form.AppField>
            <form.AppField name="confirmPassword">
              {(field) => (
                <field.TextField
                  label={m.security_confirm_password_label()}
                  type="password"
                  placeholder={m.security_confirm_password_placeholder()}
                />
              )}
            </form.AppField>
            <form.AppForm>
              <form.SubmitButton>
                {m.security_change_password()}
              </form.SubmitButton>
            </form.AppForm>
          </form>
        )}
      </ResponsiveEditDialog>
    </>
  );
}
