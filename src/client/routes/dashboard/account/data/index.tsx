import { DeletionDialog } from "~/client/components/deletion-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import { authClient } from "~/client/lib/auth-client.ts";
import * as m from "~/paraglide/messages.js";
import Mail from "~icons/lucide/mail";
import { createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

function AccountDataPage(): JSX.Element {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isAccountDeleting, setIsAccountDeleting] = createSignal(false);

  const handleAccountDelete = async () => {
    setIsAccountDeleting(true);
    await authClient.deleteUser({}, {
      onSuccess: () => {
        setIsOpen(false);
      },
      onError: (error) => {
        toast.error(error.error.message || m.account_delete_failed());
      },
    });
    setIsAccountDeleting(false);
  };

  return (
    <div class="flex flex-1 flex-col gap-10">
      <div>
        <h2>{m.account_data_title()}</h2>
        <p class="text-muted-foreground">
          {m.account_data_subtitle()}
        </p>
      </div>
      <ItemGroup class="rounded-lg border bg-card">
        <Item>
          <ItemContent>
            <ItemTitle>{m.account_delete_title()}</ItemTitle>
            <ItemDescription>
              {m.account_delete_description()}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(true)}
              disabled={isAccountDeleting()}
            >
              {m.account_delete_button()}
            </Button>
          </ItemActions>
        </Item>
      </ItemGroup>

      <DeletionDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isPending={isAccountDeleting()}
        title={m.account_delete_dialog_title()}
        description={m.account_delete_dialog_description()}
        buttonText={m.account_delete_dialog_button()}
        icon={<Mail />}
        onDelete={handleAccountDelete}
      />
    </div>
  );
}

export default AccountDataPage;
