import { A, useNavigate } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import type { Step } from "~/client/routes/auth/sign-up/index.tsx";
import * as m from "~/paraglide/messages.js";
import Fa7BrandsGitHub from "~icons/fa7-brands/github";
import Fa7BrandsGoogle from "~icons/fa7-brands/google";
import { createSignal, type JSX, Match, type Setter, Switch } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

type EmailInputProps = {
  setStep: Setter<Step>;
  setEmail: Setter<string>;
};

export function EmailInput(props: EmailInputProps): JSX.Element {
  const [isLoading, setIsLoading] = createSignal(false);
  const navigate = useNavigate();

  const emailForm = useAppForm(() => ({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: z.object({
        email: z.email(),
      }),
    },
    onSubmit: ({ value }) => {
      props.setEmail(value.email);
      props.setStep("registration");
    },
  }));

  async function handleGoogleSignUp(): Promise<void> {
    setIsLoading(true);

    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard?signup=true",
      requestSignUp: true,
      fetchOptions: {
        onError: (error) => {
          navigate("/auth/sign-up");
          toast.error(
            error.error.message || m.auth_error_generic(),
          );
        },
      },
    });
    setIsLoading(false);
  }

  async function handleGitHubSignUp(): Promise<void> {
    setIsLoading(true);

    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
      errorCallbackURL: "/auth/error",
      requestSignUp: true,
      fetchOptions: {
        onError: (error) => {
          navigate("/auth/sign-up");
          toast.error(
            error.error.message || m.auth_error_generic(),
          );
        },
      },
    });
    setIsLoading(false);
  }

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">{m.auth_sign_up_title()}</h1>
      </div>
      <div class="grid gap-6">
        <Button
          variant="outline"
          class="relative w-full cursor-pointer"
          type="button"
          onClick={handleGitHubSignUp}
          disabled={isLoading()}
        >
          <Switch>
            <Match when={isLoading()}>
              <Spinner />
            </Match>
            <Match when={!isLoading()}>
              <Fa7BrandsGitHub class="size-5" />
            </Match>
          </Switch>
          {m.auth_sign_up_github()}
        </Button>
        <Button
          variant="outline"
          class="relative w-full cursor-pointer"
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isLoading()}
        >
          <Switch>
            <Match when={isLoading()}>
              <Spinner />
            </Match>
            <Match when={!isLoading()}>
              <Fa7BrandsGoogle class="size-5" />
            </Match>
          </Switch>
          {m.auth_sign_up_google()}
        </Button>
        <Separator />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          emailForm.handleSubmit();
        }}
        class="space-y-8"
      >
        <div class="grid gap-6">
          <emailForm.AppField name="email">
            {(field) => (
              <field.TextField
                type="email"
                label={m.auth_email_label()}
                placeholder={m.auth_email_placeholder()}
              />
            )}
          </emailForm.AppField>
          <emailForm.AppForm>
            <emailForm.SubmitButton>
              {m.auth_continue()}
            </emailForm.SubmitButton>
          </emailForm.AppForm>
        </div>
      </form>
      <div class="text-center text-sm">
        {m.auth_have_account()}{" "}
        <A
          href="/auth/sign-in"
          class="underline underline-offset-4"
        >
          {m.auth_sign_in_link()}
        </A>
      </div>
    </div>
  );
}
