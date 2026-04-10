import { A, useLocation, useNavigate } from "@solidjs/router";
import { useAppForm } from "~/client/hooks/use-app-form.ts";

import { authClient } from "~/client/lib/auth-client.ts";
import * as m from "~/paraglide/messages.js";
import { createSignal, type JSX, Match, Switch } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

function ResetPasswordPage(): JSX.Element {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = createSignal(false);

  const form = useAppForm(() => ({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: z.object({
        password: z.string().min(
          8,
          m.auth_password_min_length(),
        ),
        confirmPassword: z.string().min(
          8,
          m.auth_password_min_length(),
        ),
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
      }),
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error(m.auth_invalid_link_toast());
        return;
      }

      const { password } = value;
      await authClient.resetPassword({
        newPassword: password,
        token,
        fetchOptions: {
          onError: (error) => {
            toast.error(
              error.error.message ||
                m.auth_error_generic(),
            );
          },
          onSuccess: () => {
            setIsSuccess(true);
            toast.success(m.auth_password_reset_success_toast());
          },
        },
      });
      navigate("/auth/sign-in");
    },
  }));

  return (
    <Switch
      fallback={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          class="space-y-8"
        >
          <div class="flex flex-col items-center gap-2 text-center">
            <h1 class="font-bold text-2xl">{m.auth_reset_password_title()}</h1>
            <p class="text-balance text-muted-foreground text-sm">
              {m.auth_reset_password_description()}
            </p>
          </div>
          <div class="grid gap-6">
            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  label={m.auth_new_password_label()}
                  type="password"
                  placeholder={m.auth_new_password_placeholder()}
                />
              )}
            </form.AppField>
            <form.AppField name="confirmPassword">
              {(field) => (
                <field.TextField
                  label={m.auth_confirm_password_label()}
                  type="password"
                  placeholder={m.auth_confirm_password_placeholder()}
                />
              )}
            </form.AppField>
            <form.AppForm>
              <form.SubmitButton>
                {m.auth_reset_password_button()}
              </form.SubmitButton>
            </form.AppForm>
          </div>
          <div class="text-center text-sm">
            {m.auth_remember_password()}{" "}
            <A
              href="/auth/sign-in"
              class="underline underline-offset-4"
            >
              {m.auth_sign_in_button()}
            </A>
          </div>
        </form>
      }
    >
      <Match when={!token}>
        <div class="space-y-6">
          <div class="flex flex-col items-center gap-2 text-center">
            <h1 class="font-bold text-2xl">
              {m.auth_invalid_link_title()}
            </h1>
            <p class="text-balance text-muted-foreground text-sm">
              {m.auth_invalid_link_description()}
            </p>
          </div>
          <div class="text-center">
            <A
              href="/auth/forgot-password"
              class="text-sm underline underline-offset-4"
            >
              {m.auth_request_new_link()}
            </A>
          </div>
        </div>
      </Match>
      <Match when={isSuccess()}>
        <div class="space-y-6">
          <div class="flex flex-col items-center gap-2 text-center">
            <h1 class="font-bold text-2xl">
              {m.auth_password_reset_success_title()}
            </h1>
            <p class="text-balance text-muted-foreground text-sm">
              {m.auth_password_reset_success_description()}
            </p>
          </div>
        </div>
      </Match>
    </Switch>
  );
}

export default ResetPasswordPage;
