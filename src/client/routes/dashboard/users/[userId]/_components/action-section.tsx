import { revalidate, useNavigate } from "@solidjs/router";
import { DeletionDialog } from "~/client/components/deletion-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/client/components/ui/card.tsx";
import { authClient } from "~/client/lib/auth-client.ts";
import { listUsersQuery } from "~/client/queries/auth.ts";
import * as m from "~/paraglide/messages.js";
import type { SelectUser } from "~/shared/types/auth.ts";
import Drama from "~icons/lucide/drama";
import LoaderCircle from "~icons/lucide/loader-circle";
import Trash2 from "~icons/lucide/trash-2";
import { createSignal, type JSX, Show } from "solid-js";
import type { Accessor } from "solid-js";
import { toast } from "solid-sonner";

type ImpersonateSectionProps = {
  user: Accessor<SelectUser>;
};

export function ActionSection(props: ImpersonateSectionProps): JSX.Element {
  const navigate = useNavigate();

  const [isImpersonating, setIsImpersonating] = createSignal(false);
  const [isDeleting, setIsDeleting] = createSignal(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);

  const handleImpersonate = async () => {
    setIsImpersonating(true);

    await authClient.admin.impersonateUser({
      userId: props.user().id,
    }, {
      onError: (error) => {
        toast.error(error.error.message);
      },
      onSuccess: () => {
        globalThis.location.href = "/dashboard";
      },
    });

    setIsImpersonating(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    await authClient.admin.removeUser({
      userId: props.user().id,
    }, {
      onError: (error) => {
        toast.error(error.error.message);
        setIsDeleting(false);
      },
      onSuccess: () => {
        toast.success(m.users_deleted({ name: props.user().name }));
        revalidate(listUsersQuery.key);
        navigate("/dashboard/users");
      },
    });

    setIsDeleting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.users_actions_title()}</CardTitle>
        <CardDescription>
          {m.users_actions_description()}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Button
          onClick={handleImpersonate}
          disabled={isImpersonating() || (props.user().banned ?? false)}
          class="w-full"
          variant="outline"
        >
          <Drama class="mr-2 size-4" />
          <Show when={isImpersonating()} fallback={m.users_impersonate()}>
            <LoaderCircle class="size-4 animate-spin" />
          </Show>
        </Button>

        <Button
          variant="destructive"
          class="w-full cursor-pointer"
          disabled={isDeleting()}
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 class="mr-2 size-4" />
          <Show when={isDeleting()} fallback={m.users_delete()}>
            <LoaderCircle class="size-4 animate-spin" />
          </Show>
        </Button>

        <DeletionDialog
          isOpen={deleteDialogOpen}
          setIsOpen={setDeleteDialogOpen}
          isPending={isDeleting()}
          title={m.users_delete()}
          description={m.users_delete_confirm({ name: props.user().name })}
          buttonText={m.users_delete_button()}
          icon={<Trash2 />}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
}
