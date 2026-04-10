import { createAsync, revalidate } from "@solidjs/router";
import { DeletionDialog } from "~/client/components/deletion-dialog.tsx";
import { ErrorBoundaryMessage } from "~/client/components/error-boundary-message.tsx";
import { Button } from "~/client/components/ui/button.tsx";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import { Skeleton } from "~/client/components/ui/skeleton.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { authClient } from "~/client/lib/auth-client.ts";
import { listPasskeysQuery } from "~/client/queries/auth.ts";
import * as m from "~/paraglide/messages.js";
import { getLocale } from "~/paraglide/runtime.js";
import Fingerprint from "~icons/lucide/fingerprint-pattern";
import Trash from "~icons/lucide/trash";
import {
  createSignal,
  ErrorBoundary,
  For,
  type JSX,
  Show,
  Suspense,
} from "solid-js";
import { toast } from "solid-sonner";

export function PasskeySection(): JSX.Element {
  const passkeys = createAsync(() => listPasskeysQuery());
  const [adding, setAdding] = createSignal(false);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);

  const handleAdd = async () => {
    setAdding(true);
    await authClient.passkey.addPasskey({
      fetchOptions: {
        onSuccess: () => {
          revalidate(listPasskeysQuery.key);
          toast.success(m.security_passkey_added());
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || m.security_passkey_add_failed());
        },
      },
    });
    setAdding(false);
  };

  const handleDelete = async () => {
    const id = deletingId();
    if (!id) return;
    setDeleting(true);
    await authClient.passkey.deletePasskey({
      id,
      fetchOptions: {
        onSuccess: () => {
          revalidate(listPasskeysQuery.key);
          toast.success(m.security_passkey_deleted());
          setDeleteDialogOpen(false);
          setDeletingId(null);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || m.security_passkey_delete_failed());
        },
      },
    });
    setDeleting(false);
  };

  return (
    <ItemGroup class="rounded-lg border bg-card">
      <Item>
        <ItemContent>
          <ItemTitle>{m.security_passkeys()}</ItemTitle>
          <ItemDescription>
            {m.security_passkeys_description()}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={adding()}
          >
            <Show when={adding()} fallback={m.security_add_passkey()}>
              <Spinner class="size-4" />
            </Show>
          </Button>
        </ItemActions>
      </Item>

      <ErrorBoundary
        fallback={(error) => <ErrorBoundaryMessage error={error} />}
      >
        <Suspense
          fallback={
            <>
              <ItemSeparator />
              <Item size="sm">
                <Skeleton height={16} width={16} radius={4} />
                <ItemContent>
                  <Skeleton height={16} width={128} radius={4} />
                  <Skeleton height={12} width={96} radius={4} />
                </ItemContent>
              </Item>
            </>
          }
        >
          <Show when={passkeys()}>
            {(passkeys) => (
              (
                <Show
                  when={passkeys().length > 0}
                  fallback={
                    <>
                      <ItemSeparator />
                      <Item size="sm">
                        <ItemContent>
                          <p class="text-muted-foreground text-sm">
                            {m.security_no_passkeys()}
                          </p>
                        </ItemContent>
                      </Item>
                    </>
                  }
                >
                  <For each={passkeys()}>
                    {(pk, index) => (
                      <>
                        <ItemSeparator />
                        <Item size="sm">
                          <Fingerprint class="size-4 shrink-0 text-muted-foreground" />
                          <ItemContent>
                            <ItemTitle>
                              {pk.name ||
                                m.security_passkey_name({
                                  number: String(index() + 1),
                                })}
                            </ItemTitle>
                            <ItemDescription>
                              {m.security_passkey_created()}{" "}
                              {new Date(pk.createdAt).toLocaleDateString(
                                getLocale(),
                              )}
                            </ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingId(pk.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash class="size-4 text-destructive" />
                            </Button>
                          </ItemActions>
                        </Item>
                      </>
                    )}
                  </For>
                </Show>
              )
            )}
          </Show>
        </Suspense>
      </ErrorBoundary>

      <DeletionDialog
        isOpen={deleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        isPending={deleting()}
        onDelete={handleDelete}
      />
    </ItemGroup>
  );
}
