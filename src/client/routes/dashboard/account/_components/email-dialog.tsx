import { revalidateLogic } from "@tanstack/solid-form";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import * as m from "~/paraglide/messages.js";
import { createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

type EmailDialogProps = {
  currentEmail: string;
};

export function EmailDialog(props: EmailDialogProps): JSX.Element {
  const [open, setOpen] = createSignal(false);

  const form = useAppForm(() => ({
    defaultValues: {
      email: props.currentEmail,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({
        email: z.email(),
      }),
    },
    onSubmit: async ({ formApi, value }) => {
      if (value.email === props.currentEmail) {
        toast.info(m.account_email_same());
        return;
      }

      await authClient.changeEmail(
        {
          newEmail: value.email,
          callbackURL: `/account?newEmail=${encodeURIComponent(value.email)}`,
        },
        {
          onSuccess: () => {
            formApi.reset();
            setOpen(false);
            toast.success(m.account_email_code_sent());
          },
          onError: (error) => {
            toast.error(
              error.error.message || m.account_email_update_failed(),
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
        {m.account_edit_email()}
      </Button>

      <ResponsiveEditDialog
        isOpen={open}
        setIsOpen={setOpen}
        title={m.account_edit_email()}
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
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label={m.account_email()}
                  placeholder={m.account_email_placeholder()}
                />
              )}
            </form.AppField>
            <form.AppForm>
              <form.SubmitButton>{m.common_save()}</form.SubmitButton>
            </form.AppForm>
          </form>
        )}
      </ResponsiveEditDialog>
    </>
  );
}
