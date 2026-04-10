import { revalidate } from "@solidjs/router";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { authClient } from "~/client/lib/auth-client.ts";

import { getSessionQuery } from "~/client/queries/auth.ts";
import * as m from "~/paraglide/messages.js";
import type { Accessor, JSX, Setter } from "solid-js";
import { toast } from "solid-sonner";
import { PasswordForm } from "./password-form.tsx";

type DisableTwoFactorDialogProps = {
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
};

export function DisableTwoFactorDialog(
  props: DisableTwoFactorDialogProps,
): JSX.Element {
  async function handlePasswordSubmit(password: string): Promise<void> {
    await authClient.twoFactor.disable({
      password,
      fetchOptions: {
        onSuccess: () => {
          props.setIsOpen(false);
          revalidate(getSessionQuery.key);
          toast.success(m.security_2fa_disabled_toast());
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || m.security_2fa_disable_failed(),
          );
        },
      },
    });
  }

  return (
    <ResponsiveEditDialog
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
      title={m.security_2fa_disable_title()}
      description={m.security_2fa_disable_description()}
    >
      {() => (
        <PasswordForm
          submitLabel={m.security_2fa_disable()}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </ResponsiveEditDialog>
  );
}
