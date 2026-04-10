import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { FieldGroup, FieldSet } from "~/client/components/ui/field.tsx";

import { Separator } from "~/client/components/ui/separator.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import * as m from "~/paraglide/messages.js";
import Plus from "~icons/lucide/plus";
import Search from "~icons/lucide/search";
import { createSignal, type JSX, Show } from "solid-js";

const getRoleOptions = () => [
  { value: "admin", label: m.users_role_admin() },
  { value: "user", label: m.users_role_client() },
];

export type UserFilters = {
  name: string;
  email: string;
  role: string;
};

type UserSearchProps = {
  onSubmit: (filters: UserFilters) => void;
  onClear: () => void;
};

const defaultValues: UserFilters = { name: "", email: "", role: "" };

export function UserSearch(props: UserSearchProps): JSX.Element {
  const [isDialogOpen, setIsDialogOpen] = createSignal(false);

  const form = useAppForm(() => ({
    defaultValues,
    onSubmit: ({ value }) => {
      setIsDialogOpen(false);
      props.onSubmit(value);
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
      <FieldSet class="grid grid-cols-2">
        <FieldGroup>
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label={m.users_name_label()}
                placeholder={m.users_name_label()}
              />
            )}
          </form.AppField>
        </FieldGroup>

        <FieldGroup>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label={m.users_email_label()}
                placeholder={m.users_email_label()}
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FieldSet>

      <Separator />

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form.Subscribe selector={(state) => state.values}>
          {(values) => {
            const activeCount = () => values().role ? 1 : 0;
            return (
              <Button
                variant="ghost"
                class="w-full justify-center sm:w-auto"
                type="button"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus class="h-4 w-4" />
                {m.users_filters()}
                <Show when={activeCount() > 0}>
                  <span class="ml-2 bg-primary px-2 py-0.5 text-primary-foreground text-xs">
                    {activeCount()}
                  </span>
                </Show>
              </Button>
            );
          }}
        </form.Subscribe>
        <div class="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            class="flex-1 sm:w-24 sm:flex-none"
            onClick={() => {
              form.reset();
              props.onClear();
            }}
          >
            {m.users_clear()}
          </Button>
          <form.AppForm>
            <div class="flex-1 sm:w-32 sm:flex-none">
              <form.SubmitButton variant="default">
                <Search />
                {m.users_search()}
              </form.SubmitButton>
            </div>
          </form.AppForm>
        </div>
      </div>

      <ResponsiveEditDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        title={m.users_filters()}
        description={m.users_filters_description()}
      >
        {() => (
          <div class="space-y-6 pb-4">
            <FieldSet>
              <FieldGroup>
                <form.AppField name="role">
                  {(field) => (
                    <field.SelectField
                      label={m.users_role_label()}
                      placeholder={m.users_role_placeholder()}
                      options={getRoleOptions()}
                    />
                  )}
                </form.AppField>
              </FieldGroup>
            </FieldSet>

            <Separator />

            <div class="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.setFieldValue("role", "");
                }}
              >
                {m.users_clear()}
              </Button>
              <Button
                type="button"
                onClick={() => form.handleSubmit()}
              >
                <Search class="h-4 w-4" />
                {m.users_apply_filters()}
              </Button>
            </div>
          </div>
        )}
      </ResponsiveEditDialog>
    </form>
  );
}
