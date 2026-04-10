import { createAsync, revalidate } from "@solidjs/router";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";

import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemSeparator,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import { Skeleton } from "~/client/components/ui/skeleton.tsx";
import { useSession } from "~/client/contexts/session-context.tsx";
import { authClient } from "~/client/lib/auth-client.ts";
import {
  getSessionQuery,
  viewNumberOfBackupCodesQuery,
} from "~/client/queries/auth.ts";
import * as m from "~/paraglide/messages.js";
import {
  createSignal,
  ErrorBoundary,
  type JSX,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import { toast } from "solid-sonner";
import { BackupCodesStep } from "./backup-codes-step.tsx";
import { DisableTwoFactorDialog } from "./disable-two-factor-dialog.tsx";
import { PasswordForm } from "./password-form.tsx";
import { RegenerateBackupCodesDialog } from "./regenerate-backup-codes-dialog.tsx";
import { VerifyTotpStep } from "./verify-totp-step.tsx";

type EnableStep = "password" | "verify" | "backup-codes";

export function TwoFactorSection(): JSX.Element {
  const session = useSession();
  const numberOfBackupCodes = createAsync(async () => {
    if (session.user.twoFactorEnabled) {
      return await viewNumberOfBackupCodesQuery(Number(session.user.id));
    }
    return undefined;
  });

  const [enableOpen, setEnableOpen] = createSignal(false);
  const [disableOpen, setDisableOpen] = createSignal(false);
  const [regenerateOpen, setRegenerateOpen] = createSignal(false);
  const [enableStep, setEnableStep] = createSignal<EnableStep>("password");
  const [totpUri, setTotpUri] = createSignal("");
  const [backupCodes, setBackupCodes] = createSignal<string[]>([]);

  async function handlePasswordSubmit(password: string): Promise<void> {
    const { data } = await authClient.twoFactor.enable({
      password,
      fetchOptions: {
        onError: (ctx) => {
          toast.error(
            ctx.error.message || m.security_2fa_enable_failed(),
          );
        },
      },
    });

    if (data) {
      setTotpUri(data.totpURI);
      setBackupCodes(data.backupCodes);
      setEnableStep("verify");
    }
  }

  async function handleVerifyTotpSubmit(code: string): Promise<void> {
    await authClient.twoFactor.verifyTotp({
      code,
      fetchOptions: {
        onError: (ctx) => {
          toast.error(
            ctx.error.message || m.security_2fa_verify_failed(),
          );
        },
        onSuccess: () => {
          revalidate(getSessionQuery.key);
          setEnableStep("backup-codes");
        },
      },
    });
  }

  function handleEnableOpen(): void {
    setEnableStep("password");
    setTotpUri("");
    setBackupCodes([]);
    setEnableOpen(true);
  }

  function handleEnableDialogClose(open: boolean): void {
    if (!open && enableStep() === "backup-codes") {
      toast.success(m.security_2fa_enabled_toast());
    }
    setEnableOpen(open);
  }

  return (
    <>
      <Item>
        <ItemContent>
          <ItemTitle>
            {m.security_2fa_title()}
            <Show
              when={session.user.twoFactorEnabled}
              fallback={
                <Badge variant="error" round>
                  {m.security_2fa_disabled()}
                </Badge>
              }
            >
              <Badge variant="success" round>
                {m.security_2fa_enabled()}
              </Badge>
            </Show>
          </ItemTitle>
          <ItemDescription>
            {m.security_2fa_description()}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Show
            when={session.user.twoFactorEnabled}
            fallback={
              <Button variant="outline" size="sm" onClick={handleEnableOpen}>
                {m.security_2fa_enable()}
              </Button>
            }
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisableOpen(true)}
            >
              {m.security_2fa_disable()}
            </Button>
          </Show>
        </ItemActions>
      </Item>

      <Show when={session.user.twoFactorEnabled}>
        <ItemSeparator />
        <Item size="sm">
          <ItemContent>
            <ItemTitle>{m.security_backup_codes()}</ItemTitle>
            <ItemDescription>
              <ErrorBoundary
                fallback={null}
              >
                <Suspense fallback={<Skeleton class="h-4 w-16" />}>
                  <Show when={numberOfBackupCodes()}>
                    {m.security_backup_codes_remaining({
                      count: String(numberOfBackupCodes()),
                    })}
                  </Show>
                </Suspense>
              </ErrorBoundary>
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRegenerateOpen(true)}
            >
              {m.security_regenerate()}
            </Button>
          </ItemActions>
        </Item>
      </Show>

      <ResponsiveEditDialog
        isOpen={enableOpen}
        setIsOpen={handleEnableDialogClose}
        title={enableStep() === "backup-codes"
          ? m.security_save_backup_codes()
          : m.security_2fa_enable_title()}
        description={enableStep() === "password"
          ? m.security_2fa_enable_password_description()
          : enableStep() === "verify"
          ? m.security_2fa_enable_verify_description()
          : m.security_backup_codes_store()}
      >
        {() => (
          <Switch>
            <Match when={enableStep() === "password"}>
              <PasswordForm
                submitLabel={m.security_continue()}
                onSubmit={handlePasswordSubmit}
              />
            </Match>
            <Match when={enableStep() === "verify"}>
              <VerifyTotpStep
                totpUri={totpUri()}
                onSubmit={handleVerifyTotpSubmit}
              />
            </Match>
            <Match when={enableStep() === "backup-codes"}>
              <BackupCodesStep
                backupCodes={backupCodes()}
                onDone={() => handleEnableDialogClose(false)}
              />
            </Match>
          </Switch>
        )}
      </ResponsiveEditDialog>

      <DisableTwoFactorDialog
        isOpen={disableOpen}
        setIsOpen={setDisableOpen}
      />

      <RegenerateBackupCodesDialog
        isOpen={regenerateOpen}
        setIsOpen={setRegenerateOpen}
      />
    </>
  );
}
