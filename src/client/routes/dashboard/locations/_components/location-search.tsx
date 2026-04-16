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
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import { Skeleton } from "~/client/components/ui/skeleton.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { TextField } from "~/client/components/ui/text-field.tsx";
import {
  getRetrieveQuery,
  getSuggestionsQuery,
} from "~/client/queries/search.ts";
import * as m from "~/paraglide/messages.js";
import type { MapboxSuggestion } from "~/shared/types/search.ts";

import CircleAlert from "~icons/lucide/circle-alert";
import MapPin from "~icons/lucide/map-pin";
import MapPinOff from "~icons/lucide/map-pin-off";
import MapPinPlus from "~icons/lucide/map-pin-plus";
import Search from "~icons/lucide/search";

import { createSignal, For, type JSX, onCleanup, Show } from "solid-js";
import { toast } from "solid-sonner";

export type SearchResult = {
  lat: number;
  long: number;
  name: string;
  displayName: string;
};

type LocationSearchProps = {
  onSelect: (result: SearchResult) => void;
};

export function LocationSearch(props: LocationSearchProps): JSX.Element {
  const [query, setQuery] = createSignal("");
  const [suggestions, setSuggestions] = createSignal<
    MapboxSuggestion[] | null
  >(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isRetrieving, setIsRetrieving] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");
  const [sessionToken, setSessionToken] = createSignal(crypto.randomUUID());
  const [hasFetched, setHasFetched] = createSignal(false);

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(debounceTimer));

  function resetSession(): void {
    setSessionToken(crypto.randomUUID());
    setSuggestions(null);
    setHasFetched(false);
    setQuery("");
  }

  async function fetchSuggestions(q: string): Promise<void> {
    if (q.trim().length === 0) {
      setSuggestions(null);
      setHasFetched(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const results = await getSuggestionsQuery({
        q,
        session_token: sessionToken(),
      });
      setSuggestions(results);
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
      const feature = await getRetrieveQuery({
        id: suggestion.mapbox_id,
        session_token: sessionToken(),
      });

      const [lng, lat] = feature.geometry.coordinates;
      props.onSelect({
        lat,
        long: lng,
        name: feature.properties.name,
        displayName: feature.properties.full_address ??
          feature.properties.place_formatted ??
          feature.properties.name,
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

  return (
    <>
      <TextField>
        <InputGroup>
          <InputGroupInput
            placeholder={m.map_search_placeholder()}
            value={query()}
            onInput={(e) => handleInput(e.currentTarget.value)}
            disabled={isRetrieving()}
          />
          <InputGroupAddon>
            <Show when={isLoading()} fallback={<Search />}>
              <Spinner />
            </Show>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <MapPin />
          </InputGroupAddon>
        </InputGroup>
      </TextField>

      <Show when={isLoading() && !suggestions()}>
        <div class="my-4 flex max-h-60 flex-col gap-2 overflow-auto">
          <For each={[0, 1, 2]}>
            {() => (
              <Item variant="outline">
                <ItemContent>
                  <Skeleton height={20} width={120} radius={15} />
                </ItemContent>
                <ItemActions>
                  <Button variant="outline" size="sm" disabled>
                    {m.map_set_location()}
                    <Spinner />
                  </Button>
                </ItemActions>
              </Item>
            )}
          </For>
        </div>
      </Show>

      <Show when={(suggestions()?.length ?? 0) > 0 ? suggestions() : undefined}>
        {(list) => (
          <div class="my-4 flex max-h-72 flex-col gap-2 overflow-auto">
            <For each={list()}>
              {(suggestion) => (
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>{suggestion.name}</ItemTitle>
                    <Show when={suggestion.place_formatted}>
                      <ItemDescription>
                        {suggestion.place_formatted}
                      </ItemDescription>
                    </Show>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isRetrieving()}
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <Show
                        when={!isRetrieving()}
                        fallback={<Spinner />}
                      >
                        {m.map_set_location()}
                        <MapPinPlus />
                      </Show>
                    </Button>
                  </ItemActions>
                </Item>
              )}
            </For>
          </div>
        )}
      </Show>

      <Show when={errorMessage()}>
        <Alert variant="destructive" class="my-4">
          <CircleAlert />
          <AlertTitle>{errorMessage()}</AlertTitle>
        </Alert>
      </Show>

      <Show when={hasFetched() && !isLoading() && suggestions()?.length === 0}>
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
      </Show>
    </>
  );
}
