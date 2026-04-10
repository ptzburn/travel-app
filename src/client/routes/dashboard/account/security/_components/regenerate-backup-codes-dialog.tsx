import { revalidate } from "@solidjs/router";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { authClient } from "~/client/lib/auth-client.ts";

import { viewNumberOfBackupCodesQuery } from "~/client/queries/auth.ts";
import * as m from "~/paraglide/messages.js";
import {
  type Accessor,
  createSignal,
  type JSX,
  Match,
  type Setter,
  Switch,
} from "solid-js";
import { toast } from "solid-sonner";
import { BackupCodesStep } from "./backup-codes-step.tsx";
import { PasswordForm } from "./password-form.tsx";

type RegenerateBackupCodesDialogProps = {
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
};

type Step = "password" | "codes";

export function RegenerateBackupCodesDialog(
  props: RegenerateBackupCodesDialogProps,
): JSX.Element {
  const [step, setStep] = createSignal<Step>("password");
  const [codes, setCodes] = createSignal<string[]>([]);

  async function handlePasswordSubmit(password: string): Promise<void> {
    const { data } = await authClient.twoFactor.generateBackupCodes({
      password,
      fetchOptions: {
        onSuccess: () => {
          revalidate(viewNumberOfBackupCodesQuery.key);
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || m.security_regenerate_failed(),
          );
        },
      },
    });

    if (data && data.backupCodes && data.status) {
      setCodes(data.backupCodes);
      setStep("codes");
    }
  }

  function handleClose(open: boolean): void {
    if (!open) {
      setStep("password");
      setCodes([]);
    }
    props.setIsOpen(open);
  }

  return (
    <ResponsiveEditDialog
      isOpen={props.isOpen}
      setIsOpen={handleClose}
      title={step() === "codes"
        ? m.security_save_new_codes()
        : m.security_regenerate_title()}
      description={step() === "codes"
        ? m.security_new_codes_description()
        : m.security_regenerate_description()}
    >
      {() => (
        <Switch>
          <Match when={step() === "password"}>
            <PasswordForm
              submitLabel={m.security_regenerate()}
              onSubmit={handlePasswordSubmit}
            />
          </Match>
          <Match when={step() === "codes"}>
            <BackupCodesStep
              backupCodes={codes()}
              onDone={() => handleClose(false)}
            />
          </Match>
        </Switch>
      )}
    </ResponsiveEditDialog>
  );
}
