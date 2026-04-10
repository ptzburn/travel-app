import { Button } from "~/client/components/ui/button.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import * as m from "~/paraglide/messages.js";
import { createSignal, type JSX, onCleanup, onMount, Show } from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";

type OTPValidationProps = {
  email: string;
  onBack?: () => void;
};

const RESEND_COOLDOWN = 60;

export function OTPValidation(props: OTPValidationProps): JSX.Element {
  const [isResending, setIsResending] = createSignal(false);
  const [cooldown, setCooldown] = createSignal(RESEND_COOLDOWN);
  let timer: ReturnType<typeof setInterval> | undefined;

  function startCooldown(): void {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(timer);
    timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  onMount(() => startCooldown());
  onCleanup(() => clearInterval(timer));

  async function sendOtp(): Promise<void> {
    await authClient.emailOtp.sendVerificationOtp({
      email: props.email,
      type: "email-verification",
      fetchOptions: {
        onSuccess: () => {
          toast.success(m.auth_otp_sent());
        },
        onError: (error) => {
          toast.error(error.error.message || m.auth_error_generic());
        },
      },
    });
  }

  async function handleResend(): Promise<void> {
    setIsResending(true);
    await sendOtp();
    setIsResending(false);
    startCooldown();
  }

  const otpForm = useAppForm(() => ({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: z.object({
        otp: z.string().length(6, m.auth_invalid_otp()),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.emailOtp.verifyEmail({
        email: props.email,
        otp: value.otp,
        fetchOptions: {
          onSuccess: () => {
            toast.success(m.auth_otp_verified());
            globalThis.location.href = "/";
          },
          onError: (error) => {
            toast.error(
              error.error.message || m.auth_error_generic(),
            );
          },
        },
      });
    },
  }));

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">
          {m.auth_otp_title()}
        </h1>
        <p class="text-balance text-muted-foreground text-sm">
          {m.auth_otp_description()}
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          otpForm.handleSubmit();
        }}
        class="grid gap-6"
      >
        <otpForm.AppField name="otp">
          {(field) => <field.OTPField />}
        </otpForm.AppField>
        <div class="flex items-center justify-center gap-1 text-sm">
          <span class="text-muted-foreground">
            {m.auth_otp_not_received()}
          </span>
          <Button
            variant="link"
            type="button"
            class="h-auto p-0 text-sm"
            onClick={handleResend}
            disabled={isResending() || cooldown() > 0}
          >
            {cooldown() > 0
              ? m.auth_resend_cooldown({ seconds: String(cooldown()) })
              : m.auth_resend()}
          </Button>
        </div>
        <otpForm.AppForm>
          <otpForm.SubmitButton>
            {m.common_verify()}
          </otpForm.SubmitButton>
        </otpForm.AppForm>
        <Show when={props.onBack}>
          <Button
            variant="outline"
            class="w-full"
            type="button"
            onClick={() => props.onBack?.()}
          >
            {m.common_back()}
          </Button>
        </Show>
      </form>
    </div>
  );
}
