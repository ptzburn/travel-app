import { A } from "@solidjs/router";
import { Alert, AlertTitle } from "~/client/components/ui/alert.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/client/components/ui/empty.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/client/components/ui/input-group.tsx";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import { Skeleton } from "~/client/components/ui/skeleton.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { getLocationsQuery } from "~/client/queries/locations.ts";
import {
  getRetrieveQuery,
  getSuggestionsQuery,
} from "~/client/queries/search.ts";
import * as m from "~/paraglide/messages.js";
import { getLocale } from "~/paraglide/runtime.js";
import type { LocationResponse } from "~/shared/types/locations.ts";

import type { MapboxSuggestion } from "~/shared/types/search.ts";
import CircleAlert from "~icons/lucide/circle-alert";
import Globe from "~icons/lucide/globe";
import MapPin from "~icons/lucide/map-pin";
import MapPinOff from "~icons/lucide/map-pin-off";
import Search from "~icons/lucide/search";

import X from "~icons/lucide/x";
import { createSignal, For, type JSX, onCleanup, Show } from "solid-js";
import { toast } from "solid-sonner";

const MAX_LOCATION_RESULTS = 3;

export function SearchBar(): JSX.Element {
  const [query, setQuery] = createSignal("");
  const [suggestions, setSuggestions] = createSignal<
    MapboxSuggestion[] | null
  >(null);
  const [locationResults, setLocationResults] = createSignal<
    LocationResponse[] | null
  >(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isRetrieving, setIsRetrieving] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");
  const [sessionToken, setSessionToken] = createSignal(crypto.randomUUID());
  const [hasFetched, setHasFetched] = createSignal(false);
  const [isFocused, setIsFocused] = createSignal(false);

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(debounceTimer));

  function resetSession(): void {
    setSessionToken(crypto.randomUUID());
    setSuggestions(null);
    setLocationResults(null);
    setHasFetched(false);
    setQuery("");
    setErrorMessage("");
  }

  async function fetchSuggestions(q: string): Promise<void> {
    if (q.trim().length === 0) {
      setSuggestions(null);
      setLocationResults(null);
      setHasFetched(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const [locResult, mapboxResult] = await Promise.allSettled([
        getLocationsQuery({ search: q }),
        getSuggestionsQuery({
          q,
          session_token: sessionToken(),
          limit: 5,
          language: getLocale(),
        }),
      ]);

      setLocationResults(
        locResult.status === "fulfilled"
          ? locResult.value.slice(0, MAX_LOCATION_RESULTS)
          : [],
      );
      setSuggestions(
        mapboxResult.status === "fulfilled" ? mapboxResult.value : [],
      );

      if (
        locResult.status === "rejected" && mapboxResult.status === "rejected"
      ) {
        const message = Error.isError(mapboxResult.reason)
          ? mapboxResult.reason.message
          : m.map_unknown_error();
        setErrorMessage(message);
        toast.error(message);
      }

      setHasFetched(true);
    } catch (error) {
      const message = Error.isError(error)
        ? error.message
        : m.map_unknown_error();
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleInput(value: string): void {
    setQuery(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  }

  async function handleSelectSuggestion(
    suggestion: MapboxSuggestion,
  ): Promise<void> {
    setIsRetrieving(true);
    setErrorMessage("");
    try {
      const _feature = await getRetrieveQuery({
        id: suggestion.mapbox_id,
        session_token: sessionToken(),
      });

      resetSession();
    } catch (error) {
      const message = Error.isError(error)
        ? error.message
        : m.map_unknown_error();
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsRetrieving(false);
    }
  }

  const hasLocationResults = (): boolean =>
    (locationResults()?.length ?? 0) > 0;
  const hasMapboxResults = (): boolean => (suggestions()?.length ?? 0) > 0;
  const hasAnyResults = (): boolean =>
    hasLocationResults() || hasMapboxResults();

  const showDropdown = (): boolean =>
    isFocused() &&
    (hasFetched() ||
      (isLoading() && !suggestions() && !locationResults()) ||
      Boolean(errorMessage()));

  return (
    <div
      class="relative"
      onFocusIn={() => setIsFocused(true)}
      onFocusOut={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
    >
      <InputGroup>
        <InputGroupAddon>
          <Show when={isLoading()} fallback={<Search />}>
            <Spinner />
          </Show>
        </InputGroupAddon>
        <InputGroupInput
          placeholder={m.map_search_placeholder()}
          value={query()}
          onInput={(e) => handleInput(e.currentTarget.value)}
          disabled={isRetrieving()}
          class="pr-8"
        />
      </InputGroup>
      <Show when={query().length > 0}>
        <Button
          variant="ghost"
          size="icon-sm"
          class="absolute top-1/2 right-1.5 size-6 -translate-y-1/2"
          onClick={() => resetSession()}
          disabled={isRetrieving()}
          aria-label={m.common_close()}
        >
          <X class="size-3.5" />
        </Button>
      </Show>

      <Show when={showDropdown()}>
        <div class="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <Show when={isLoading() && !suggestions() && !locationResults()}>
            <div class="flex flex-col">
              <For each={[0, 1, 2]}>
                {(_, index) => (
                  <>
                    <Show when={index() > 0}>
                      <ItemSeparator />
                    </Show>
                    <div class="flex items-center justify-between p-4">
                      <Skeleton height={16} width={140} radius={8} />
                      <Skeleton height={24} width={80} radius={8} />
                    </div>
                  </>
                )}
              </For>
            </div>
          </Show>

          <Show when={hasAnyResults()}>
            <Show
              when={hasLocationResults() ? locationResults() : undefined}
            >
              {(locs) => (
                <>
                  <div class="flex items-center gap-1.5 px-3 pt-2 pb-1">
                    <MapPin class="size-3 text-muted-foreground" />
                    <span class="font-medium text-muted-foreground text-xs">
                      {m.search_your_locations()}
                    </span>
                  </div>
                  <ItemGroup>
                    <For each={locs()}>
                      {(location, index) => (
                        <>
                          <Show when={index() > 0}>
                            <ItemSeparator />
                          </Show>
                          <Item
                            as={A}
                            href={`/dashboard/locations/${location.slug}`}
                            class="w-full cursor-pointer rounded-none text-left hover:bg-accent/50"
                          >
                            <ItemMedia>
                              <MapPin class="size-4 text-primary" />
                            </ItemMedia>
                            <ItemContent>
                              <ItemTitle>{location.name}</ItemTitle>
                              <Show when={location.description}>
                                <ItemDescription>
                                  {location.description}
                                </ItemDescription>
                              </Show>
                            </ItemContent>
                          </Item>
                        </>
                      )}
                    </For>
                  </ItemGroup>
                </>
              )}
            </Show>

            <Show when={hasLocationResults() && hasMapboxResults()}>
              <ItemSeparator />
            </Show>

            <Show
              when={hasMapboxResults() ? suggestions() : undefined}
            >
              {(list) => (
                <>
                  <div class="flex items-center gap-1.5 px-3 pt-2 pb-1">
                    <Globe class="size-3 text-muted-foreground" />
                    <span class="font-medium text-muted-foreground text-xs">
                      {m.search_global_results()}
                    </span>
                  </div>
                  <ItemGroup>
                    <For each={list()}>
                      {(suggestion, index) => (
                        <>
                          <Show when={index() > 0}>
                            <ItemSeparator />
                          </Show>
                          <Item
                            as="button"
                            type="button"
                            class="w-full cursor-pointer rounded-none text-left hover:bg-accent/50"
                            disabled={isRetrieving()}
                            onClick={() => handleSelectSuggestion(suggestion)}
                          >
                            <ItemMedia>
                              <Globe class="size-4 text-muted-foreground" />
                            </ItemMedia>
                            <ItemContent>
                              <ItemTitle>{suggestion.name}</ItemTitle>
                              <Show when={suggestion.place_formatted}>
                                <ItemDescription>
                                  {suggestion.place_formatted}
                                </ItemDescription>
                              </Show>
                            </ItemContent>
                          </Item>
                        </>
                      )}
                    </For>
                  </ItemGroup>
                </>
              )}
            </Show>
          </Show>

          <Show when={errorMessage()}>
            <Alert variant="destructive" class="m-2">
              <CircleAlert />
              <AlertTitle>{errorMessage()}</AlertTitle>
            </Alert>
          </Show>

          <Show
            when={hasFetched() && !isLoading() && !hasAnyResults()}
          >
            <div class="p-4">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MapPinOff />
                  </EmptyMedia>
                  <EmptyTitle>{m.map_no_locations()}</EmptyTitle>
                  <EmptyDescription>
                    {m.map_no_locations_description()}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}
