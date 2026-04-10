import { createAsync, revalidate } from "@solidjs/router";
import { ConfirmationDialog } from "~/client/components/confirmation-dialog.tsx";
import { ErrorBoundaryMessage } from "~/client/components/error-boundary-message.tsx";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/client/components/ui/table.tsx";
import { useSession } from "~/client/contexts/session-context.tsx";
import { authClient } from "~/client/lib/auth-client.ts";
import { listSessionsQuery } from "~/client/queries/auth.ts";
import * as m from "~/paraglide/messages.js";
import { getLocale } from "~/paraglide/runtime.js";
import Monitor from "~icons/lucide/monitor";
import Smartphone from "~icons/lucide/smartphone";
import Tablet from "~icons/lucide/tablet";
import {
  createSignal,
  ErrorBoundary,
  For,
  type JSX,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import { toast } from "solid-sonner";

function parseUserAgent(
  ua?: string | null,
): { browser: string; os: string; device: "mobile" | "tablet" | "desktop" } {
  if (!ua) {
    return {
      browser: m.sessions_unknown(),
      os: m.sessions_unknown(),
      device: "desktop" as const,
    };
  }

  let browser: string = m.sessions_unknown();
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  let os: string = m.sessions_unknown();
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let device: "mobile" | "tablet" | "desktop" = "desktop";
  if (ua.includes("Mobile") || ua.includes("Android")) device = "mobile";
  if (ua.includes("iPad") || ua.includes("Tablet")) device = "tablet";

  return { browser, os, device };
}

function DeviceIcon(
  props: { device: "mobile" | "tablet" | "desktop"; class?: string },
): JSX.Element {
  return (
    <Switch>
      <Match when={props.device === "mobile"}>
        <Smartphone class={props.class} />
      </Match>
      <Match when={props.device === "tablet"}>
        <Tablet class={props.class} />
      </Match>
      <Match when={props.device === "desktop"}>
        <Monitor class={props.class} />
      </Match>
    </Switch>
  );
}

function formatDate(
  date: Date | string | null | undefined,
): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(getLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SessionsRoute(): JSX.Element {
  const sessions = createAsync(() => listSessionsQuery());
  const session = useSession();
  const [confirmOpen, setConfirmOpen] = createSignal(false);
  const [revokingToken, setRevokingToken] = createSignal<string | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = createSignal(false);
  const [revokingAll, setRevokingAll] = createSignal(false);

  const hasOtherSessions = () =>
    (sessions() ?? []).some((s) => s.token !== session.session.token);

  const handleRevoke = async () => {
    const token = revokingToken();
    if (!token) return;

    await authClient.revokeSession({
      token,
      fetchOptions: {
        onSuccess: () => {
          revalidate(listSessionsQuery.key);
          toast.success(m.sessions_revoked());
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || m.sessions_revoke_failed());
        },
      },
    });

    setRevokingToken(null);
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    await authClient.revokeOtherSessions({
      fetchOptions: {
        onSuccess: () => {
          revalidate(listSessionsQuery.key);
          toast.success(m.sessions_revoke_all_success());
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || m.sessions_revoke_all_failed());
        },
      },
    });
    setRevokingAll(false);
  };

  return (
    <div class="flex flex-1 flex-col gap-4">
      <div>
        <h2>{m.sessions_title()}</h2>
        <p class="text-muted-foreground">
          {m.sessions_subtitle()}
        </p>
      </div>

      <ErrorBoundary
        fallback={(error) => <ErrorBoundaryMessage error={error} />}
      >
        <Suspense
          fallback={
            <div class="flex flex-1 items-center justify-center">
              <Spinner class="size-10" />
            </div>
          }
        >
          <div class="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="text text-text">
                    {m.sessions_device()}
                  </TableHead>
                  <TableHead class="hidden text-text sm:table-cell">
                    {m.sessions_ip_address()}
                  </TableHead>
                  <TableHead class="hidden text-text md:table-cell">
                    {m.sessions_signed_in()}
                  </TableHead>
                  <TableHead class="text-text">
                    {m.sessions_expires()}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Show when={sessions()}>
                  {(sessions) => (
                    <Show
                      when={sessions().length > 0}
                      fallback={
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            class="py-8 text-center text-muted-foreground"
                          >
                            {m.sessions_empty()}
                          </TableCell>
                        </TableRow>
                      }
                    >
                      <For each={sessions()}>
                        {(s) => {
                          const parsed = parseUserAgent(s.userAgent);
                          const isCurrent = () =>
                            s.token === session.session.token;

                          return (
                            <TableRow>
                              <TableCell>
                                <div class="flex items-center gap-3">
                                  <DeviceIcon
                                    device={parsed.device}
                                    class="size-5 shrink-0 text-muted-foreground"
                                  />
                                  <div class="flex flex-col gap-0.5">
                                    <div class="flex items-center gap-2">
                                      <span class="font-medium">
                                        {parsed.browser}
                                      </span>
                                      <Show when={isCurrent()}>
                                        <Badge
                                          variant="success"
                                          class="px-1.5 py-0 text-[10px]"
                                        >
                                          {m.sessions_current()}
                                        </Badge>
                                      </Show>
                                    </div>
                                    <span class="text-muted-foreground text-xs">
                                      {parsed.os}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell class="hidden text-muted-foreground sm:table-cell">
                                {s.ipAddress ?? "—"}
                              </TableCell>
                              <TableCell class="hidden text-muted-foreground md:table-cell">
                                {formatDate(s.createdAt)}
                              </TableCell>
                              <TableCell class="text-muted-foreground">
                                {formatDate(s.expiresAt)}
                              </TableCell>
                              <TableCell class="text-right">
                                <Show
                                  when={!isCurrent()}
                                  fallback={null}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={revokingToken() === s.token}
                                    onClick={() => {
                                      setRevokingToken(s.token);
                                      setConfirmOpen(true);
                                    }}
                                  >
                                    <Show
                                      when={revokingToken() === s.token}
                                    >
                                      <Spinner class="size-4" />
                                    </Show>
                                    <span class="ml-1 hidden sm:inline">
                                      {m.sessions_revoke()}
                                    </span>
                                  </Button>
                                </Show>
                              </TableCell>
                            </TableRow>
                          );
                        }}
                      </For>
                    </Show>
                  )}
                </Show>
              </TableBody>
            </Table>
          </div>

          <Show when={hasOtherSessions()}>
            <Button
              variant="secondary"
              class="w-fit"
              disabled={revokingAll()}
              onClick={() => setRevokeAllOpen(true)}
            >
              <Show when={revokingAll()}>
                <Spinner class="size-4" />
              </Show>
              {m.sessions_revoke_all()}
            </Button>
          </Show>
        </Suspense>
      </ErrorBoundary>

      <ConfirmationDialog
        open={revokeAllOpen}
        onOpenChange={setRevokeAllOpen}
        onConfirm={handleRevokeAll}
        title={m.sessions_revoke_all_title()}
        description={m.sessions_revoke_all_description()}
        confirmText={m.sessions_revoke_all_confirm()}
        cancelText={m.common_cancel()}
      />

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setRevokingToken(null);
        }}
        onConfirm={handleRevoke}
        title={m.sessions_revoke_title()}
        description={m.sessions_revoke_description()}
        confirmText={m.sessions_revoke()}
        cancelText={m.common_cancel()}
      />
    </div>
  );
}
