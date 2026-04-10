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
  InputGroupButton,
  InputGroupInput,
} from "~/client/components/ui/input-group.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import { Skeleton } from "~/client/components/ui/skeleton.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import {
  TextField,
  TextFieldErrorMessage,
} from "~/client/components/ui/text-field.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { getSearchResultsQuery } from "~/client/queries/search.ts";
import * as m from "~/paraglide/messages.js";
import { SearchSchema } from "~/shared/schemas/zod.ts";
import type { NominatimResult } from "~/shared/types/search.ts";

import CircleAlert from "~icons/lucide/circle-alert";
import MapPin from "~icons/lucide/map-pin";
import MapPinOff from "~icons/lucide/map-pin-off";
import MapPinPlus from "~icons/lucide/map-pin-plus";
import Search from "~icons/lucide/search";

import { createSignal, For, type JSX, Show } from "solid-js";
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
  const [searchResults, setSearchResults] = createSignal<
    NominatimResult[] | null
  >(null);
  const [errorMessage, setErrorMessage] = createSignal("");

  const form = useAppForm(() => ({
    defaultValues: {
      q: "",
    },
    validators: {
      onSubmit: SearchSchema,
    },
    onSubmitInvalid: () => {
      toast.error(m.map_search_error());
    },
    onSubmit: async ({ value }) => {
      try {
        setErrorMessage("");
        const result = await getSearchResultsQuery(value);
        setSearchResults(result);
      } catch (error) {
        const message = Error.isError(error)
          ? error.message
          : m.map_unknown_error();
        setErrorMessage(message);
        toast.error(message);
      }
    },
  }));

  function handleSetLocation(location: NominatimResult): void {
    props.onSelect({
      lat: Number(location.lat),
      long: Number(location.lon),
      name: location.name,
      displayName: location.display_name,
    });
    form.reset();
    setSearchResults(null);
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field name="q">
          {(field) => {
            const isInvalid = () =>
              field().state.meta.isTouched && !field().state.meta.isValid;
            return (
              <>
                <TextField
                  data-invalid={isInvalid()}
                  validationState={isInvalid() ? "invalid" : "valid"}
                >
                  <InputGroup>
                    <InputGroupInput
                      name={field().name}
                      placeholder={m.map_search_placeholder()}
                      value={field().state.value}
                      onInput={(e) =>
                        field().handleChange(e.currentTarget.value)}
                      onBlur={field().handleBlur}
                      aria-invalid={isInvalid()}
                      disabled={field().form.state.isSubmitting}
                    />
                    <InputGroupAddon>
                      <MapPin />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="submit"
                        variant="default"
                        size="xs"
                        disabled={field().form.state.isSubmitting ||
                          field().state.value.trim() === ""}
                      >
                        <Show
                          when={!field().form.state.isSubmitting}
                          fallback={<Spinner />}
                        >
                          <Search />
                        </Show>
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <Show when={isInvalid()}>
                    {field().state.meta.errors.length > 0
                      ? (field().state.meta.errors.map(
                        (error) =>
                          error?.message && (
                            <TextFieldErrorMessage>
                              {error.message}
                            </TextFieldErrorMessage>
                          ),
                      ))
                      : null}
                  </Show>
                </TextField>

                <Show when={field().form.state.isSubmitting}>
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
              </>
            );
          }}
        </form.Field>
      </form>

      <Show when={searchResults()}>
        {(results) => (
          <div class="my-4 flex max-h-72 flex-col gap-2 overflow-auto">
            <For each={results()}>
              {(result) => (
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>{result.display_name}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetLocation(result)}
                    >
                      {m.map_set_location()}
                      <MapPinPlus />
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

      <Show when={searchResults() !== null && searchResults()?.length === 0}>
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
