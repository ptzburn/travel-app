import { useAppForm } from "~/client/hooks/use-app-form.ts";
import * as m from "~/paraglide/messages.js";
import type { JSX } from "solid-js";
import z from "zod";

type PasswordFormProps = {
  submitLabel: string;
  onSubmit: (password: string) => void;
};

export function PasswordForm(props: PasswordFormProps): JSX.Element {
  const form = useAppForm(() => ({
    defaultValues: { password: "" },
    validators: {
      onSubmit: z.object({
        password: z.string().min(
          8,
          m.security_password_min_length(),
        ),
      }),
    },
    // deno-lint-ignore require-await
    onSubmit: async ({ value }) => {
      props.onSubmit(value.password);
    },
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      class="space-y-4"
    >
      <form.AppField name="password">
        {(field) => (
          <field.TextField
            label={m.security_password_label()}
            type="password"
            placeholder={m.security_password_placeholder()}
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>{props.submitLabel}</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}
