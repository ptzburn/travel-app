import { revalidate } from "@solidjs/router";

import { Button } from "~/client/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/client/components/ui/dialog.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import * as m from "~/paraglide/messages.js";
import { createEffect, createSignal, type JSX, on } from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";

type EmailChangeOTPDialogProps = {
  newEmail: string | null;
  onClose: () => void;
};

export function EmailChangeOTPDialog(
  props: EmailChangeOTPDialogProps,
): JSX.Element {
  const [open, setOpen] = createSignal(false);
  let dialogOpened = false;

  createEffect(
    on(
      () => props.newEmail,
      (email) => {
        if (email && !dialogOpened) {
          dialogOpened = true;
          setOpen(true);
        }
      },
    ),
  );

  const resendOTP = async (newEmail: string) => {
    await authClient.emailOtp.requestEmailChange({
      newEmail,
    }, {
      onSuccess: () => {
        toast.success(m.account_email_code_sent());
      },
      onError: () => {
        toast.error(m.account_verify_resend_failed());
      },
    });
  };

  const handleClose = () => {
    setOpen(false);
    props.onClose();
  };

  const form = useAppForm(() => ({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: z.object({
        otp: z.string().length(6, m.account_verify_invalid_code()),
      }),
    },
    onSubmit: async ({ value }) => {
      if (!props.newEmail) return;

      await authClient.emailOtp.changeEmail({
        newEmail: props.newEmail,
        otp: value.otp,
        fetchOptions: {
          onSuccess: () => {
            toast.success(m.account_email_changed());
            handleClose();
            void revalidate("session");
          },
          onError: (error) => {
            toast.error(
              error.error.message ||
                m.account_email_change_failed(),
            );
          },
        },
      });
    },
  }));

  return (
    <Dialog
      open={open()}
      onOpenChange={(next) => {
        if (!next) {
          handleClose();
        }
      }}
    >
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          class="space-y-6"
        >
          <DialogHeader>
            <DialogTitle>{m.account_verify_email_title()}</DialogTitle>
            <DialogDescription>
              {m.account_verify_email_description()}
            </DialogDescription>
          </DialogHeader>

          <form.AppField name="otp">
            {(field) => <field.OTPField />}
          </form.AppField>

          <DialogFooter class="flex-col gap-2 sm:flex-col">
            <form.AppForm>
              <form.SubmitButton>
                {m.common_verify()}
              </form.SubmitButton>
            </form.AppForm>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (props.newEmail) {
                  resendOTP(props.newEmail);
                }
              }}
            >
              {m.account_verify_resend()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
