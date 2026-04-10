import { Turnstile } from "@nerimity/solid-turnstile";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import { capitalize } from "~/client/lib/utils.ts";
import type { Step } from "~/client/routes/auth/sign-up/index.tsx";
import * as m from "~/paraglide/messages.js";
import Mail from "~icons/lucide/mail";
import { type Accessor, createSignal, type JSX, type Setter } from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";

type RegistrationProps = {
  email: Accessor<string>;
  setStep: Setter<Step>;
};

export function Registration(props: RegistrationProps): JSX.Element {
  const [turnstileToken, setTurnstileToken] = createSignal<string>();

  const registrationFormSchema = z
    .object({
      firstName: z.string()
        .min(2),
      lastName: z.string()
        .min(2),
      password: z.string().min(8),
      confirmPassword: z.string().min(8),
    }).superRefine((data, context) => {
      if (data.password !== data.confirmPassword) {
        context.addIssue({
          code: "custom",
          message: m.auth_passwords_no_match(),
          path: ["password"],
        });
        context.addIssue({
          code: "custom",
          message: m.auth_passwords_no_match(),
          path: ["confirmPassword"],
        });
      }
    });

  const registrationForm = useAppForm(() => ({
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: registrationFormSchema,
    },
    onSubmit: async ({ value }) => {
      const fullName = `${capitalize(value.firstName)} ${
        capitalize(value.lastName)
      }`.trim();

      await authClient.signUp.email({
        email: props.email(),
        password: value.password,
        name: fullName,
        fetchOptions: {
          headers: {
            "x-captcha-response": turnstileToken() ?? "",
          },
          onSuccess: () => {
            props.setStep("otp");
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        registrationForm.handleSubmit();
      }}
      class="space-y-8"
    >
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">
          {m.auth_register_title()}
        </h1>
        <Badge
          variant="secondary"
          class="flex items-center gap-2"
        >
          <Mail class="size-4" />
          {props.email()}
        </Badge>
      </div>
      <div class="grid gap-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <registrationForm.AppField name="firstName">
            {(field) => (
              <field.TextField
                type="text"
                placeholder={m.auth_first_name()}
              />
            )}
          </registrationForm.AppField>

          <registrationForm.AppField name="lastName">
            {(field) => (
              <field.TextField
                type="text"
                placeholder={m.auth_last_name()}
              />
            )}
          </registrationForm.AppField>
        </div>

        <registrationForm.AppField name="password">
          {(field) => (
            <field.TextField
              type="password"
              placeholder={m.auth_password()}
            />
          )}
        </registrationForm.AppField>
        <registrationForm.AppField name="confirmPassword">
          {(field) => (
            <field.TextField
              type="password"
              placeholder={m.auth_confirm_password()}
            />
          )}
        </registrationForm.AppField>
        <div class="flex justify-center">
          <Turnstile
            sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            onVerify={setTurnstileToken}
            autoResetOnExpire
          />
        </div>
        <registrationForm.AppForm>
          <registrationForm.SubmitButton disabled={!turnstileToken()}>
            {m.auth_create_account()}
          </registrationForm.SubmitButton>
        </registrationForm.AppForm>
        <Button
          variant="outline"
          class="w-full"
          type="button"
          onClick={() => {
            props.setStep("email");
          }}
          disabled={registrationForm.state.isSubmitting}
        >
          {m.common_back()}
        </Button>
      </div>
    </form>
  );
}
