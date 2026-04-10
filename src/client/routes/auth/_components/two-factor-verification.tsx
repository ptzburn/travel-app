import { Button } from "~/client/components/ui/button.tsx";
import { Checkbox } from "~/client/components/ui/checkbox.tsx";
import { Label } from "~/client/components/ui/label.tsx";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/client/components/ui/tooltip.tsx";

import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import * as m from "~/paraglide/messages.js";
import CircleQuestionMark from "~icons/lucide/circle-question-mark";
import {
  type Accessor,
  createSignal,
  type JSX,
  Match,
  Show,
  Switch,
} from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";

type TwoFactorVerificationProps = {
  onBack?: () => void;
};

type TwoFactorMethod = "totp" | "backup";

function TrustDeviceCheckbox(props: {
  checked: Accessor<boolean>;
  onChange: (checked: boolean) => void;
}): JSX.Element {
  return (
    <div class="flex flex-row items-center gap-2">
      <Checkbox
        checked={props.checked()}
        onChange={props.onChange}
      />
      <Label>
        {m.auth_trust_device()}
      </Label>
      <Tooltip>
        <TooltipTrigger class="text-muted-foreground">
          <CircleQuestionMark class="size-4" />
        </TooltipTrigger>
        <TooltipContent>
          {m.auth_trust_device_tooltip()}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function TotpForm(props: {
  trustDevice: Accessor<boolean>;
  onTrustDeviceChange: (checked: boolean) => void;
  onUseBackup: () => void;
  onBack?: () => void;
}): JSX.Element {
  const form = useAppForm(() => ({
    defaultValues: { code: "" },
    validators: {
      onSubmit: z.object({
        code: z.string().length(6, m.auth_invalid_code()),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.verifyTotp({
        code: value.code,
        trustDevice: props.trustDevice(),
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message || m.auth_error_generic());
          },
          onSuccess: () => {
            globalThis.location.href = "/dashboard";
          },
        },
      });
    },
  }));

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">{m.auth_2fa_title()}</h1>
        <p class="text-balance text-muted-foreground text-sm">
          {m.auth_2fa_totp_description()}
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        class="grid gap-6"
      >
        <form.AppField name="code">
          {(field) => <field.OTPField />}
        </form.AppField>
        <Button
          variant="link"
          class="h-auto p-0 text-sm"
          type="button"
          onClick={props.onUseBackup}
        >
          {m.auth_use_backup_code()}
        </Button>
        <TrustDeviceCheckbox
          checked={props.trustDevice}
          onChange={props.onTrustDeviceChange}
        />
        <form.AppForm>
          <form.SubmitButton>{m.common_verify()}</form.SubmitButton>
        </form.AppForm>
        <div class="flex flex-col gap-3">
          <Show when={props.onBack}>
            <Button
              variant="outline"
              class="w-full"
              type="button"
              onClick={() => props.onBack?.()}
              disabled={form.state.isSubmitting}
            >
              {m.common_back()}
            </Button>
          </Show>
        </div>
      </form>
    </div>
  );
}

function BackupCodeForm(props: {
  trustDevice: Accessor<boolean>;
  onTrustDeviceChange: (checked: boolean) => void;
  onUseTotp: () => void;
  onBack?: () => void;
}): JSX.Element {
  const form = useAppForm(() => ({
    defaultValues: { code: "" },
    validators: {
      onSubmit: z.object({
        code: z.string().min(1, m.auth_invalid_code()),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.verifyBackupCode({
        code: value.code,
        trustDevice: props.trustDevice(),
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message || m.auth_error_generic());
          },
          onSuccess: () => {
            globalThis.location.href = "/dashboard";
          },
        },
      });
    },
  }));

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">{m.auth_2fa_title()}</h1>
        <p class="text-balance text-muted-foreground text-sm">
          {m.auth_2fa_backup_description()}
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        class="grid gap-6"
      >
        <form.AppField name="code">
          {(field) => (
            <field.TextField
              label={m.auth_backup_code_label()}
              placeholder={m.auth_backup_code_placeholder()}
            />
          )}
        </form.AppField>
        <Button
          variant="link"
          class="h-auto p-0 text-sm"
          type="button"
          onClick={props.onUseTotp}
        >
          {m.auth_use_totp()}
        </Button>
        <TrustDeviceCheckbox
          checked={props.trustDevice}
          onChange={props.onTrustDeviceChange}
        />
        <form.AppForm>
          <form.SubmitButton>{m.common_verify()}</form.SubmitButton>
        </form.AppForm>
        <div class="flex flex-col gap-3">
          <Show when={props.onBack}>
            <Button
              variant="outline"
              class="w-full"
              type="button"
              onClick={() => props.onBack?.()}
              disabled={form.state.isSubmitting}
            >
              {m.common_back()}
            </Button>
          </Show>
        </div>
      </form>
    </div>
  );
}

export function TwoFactorVerification(
  props: TwoFactorVerificationProps,
): JSX.Element {
  const [method, setMethod] = createSignal<TwoFactorMethod>("totp");
  const [trustDevice, setTrustDevice] = createSignal(false);

  return (
    <Switch>
      <Match when={method() === "totp"}>
        <TotpForm
          trustDevice={trustDevice}
          onTrustDeviceChange={setTrustDevice}
          onUseBackup={() => setMethod("backup")}
          onBack={props.onBack}
        />
      </Match>
      <Match when={method() === "backup"}>
        <BackupCodeForm
          trustDevice={trustDevice}
          onTrustDeviceChange={setTrustDevice}
          onUseTotp={() => setMethod("totp")}
          onBack={props.onBack}
        />
      </Match>
    </Switch>
  );
}
