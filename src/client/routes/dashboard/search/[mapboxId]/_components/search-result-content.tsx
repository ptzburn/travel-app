import { createAsync } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { getRetrieveQuery } from "~/client/queries/search.ts";
import { AddFromSearchDialog } from "~/client/routes/dashboard/search/[mapboxId]/_components/add-from-search-dialog.tsx";
import { setMapMode } from "~/client/stores/map-store.ts";
import * as m from "~/paraglide/messages.js";
import type { MapboxFeature } from "~/shared/types/search.ts";
import PlusIcon from "~icons/lucide/plus";
import {
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  Show,
} from "solid-js";

const featureTypeLabel = (
  type: MapboxFeature["properties"]["feature_type"],
): string => {
  switch (type) {
    case "poi":
      return m.search_result_type_poi();
    case "country":
      return m.search_result_type_country();
    case "region":
      return m.search_result_type_region();
    case "place":
      return m.search_result_type_place();
    case "district":
      return m.search_result_type_district();
    case "neighborhood":
      return m.search_result_type_neighborhood();
    case "address":
      return m.search_result_type_address();
    case "locality":
      return m.search_result_type_locality();
    case "postcode":
      return m.search_result_type_postcode();
  }
};

type SearchResultContentProps = {
  mapboxId: string;
};

export function SearchResultContent(
  props: SearchResultContentProps,
): JSX.Element {
  const [isAddOpen, setIsAddOpen] = createSignal(false);

  const feature = createAsync(() =>
    getRetrieveQuery({
      id: props.mapboxId,
      session_token: crypto.randomUUID(),
    })
  );

  createEffect(() => {
    const f = feature();
    if (!f) return;
    const [long, lat] = f.geometry.coordinates;
    setMapMode({
      mode: "view",
      locations: [{
        id: 0,
        name: f.properties.name,
        slug: `mapbox-${f.properties.mapbox_id}`,
        description: f.properties.place_formatted ?? null,
        lat,
        long,
        href: "",
      }],
    });
  });

  onCleanup(() => setMapMode({ mode: "view", locations: [] }));

  return (
    <div class="flex min-h-0 flex-1 flex-col gap-4">
      <Show
        when={feature()}
        fallback={
          <div class="flex flex-1 items-center justify-center">
            <Spinner class="size-6" />
          </div>
        }
      >
        {(f) => {
          const category = () => f().properties.poi_category?.join(", ");
          const brand = () => f().properties.brand?.join(", ");
          const accuracy = () => f().properties.coordinates.accuracy;
          const context = () => f().properties.context;
          return (
            <>
              <div class="flex flex-col gap-3">
                <h2 class="wrap-break-word font-semibold text-xl">
                  {f().properties.name}
                </h2>
                <Show
                  when={f().properties.full_address &&
                    f().properties.full_address !==
                      f().properties.place_formatted}
                >
                  <p class="text-muted-foreground text-sm">
                    {f().properties.full_address}
                  </p>
                </Show>
                <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt class="text-muted-foreground">
                    {m.search_result_type()}
                  </dt>
                  <dd>{featureTypeLabel(f().properties.feature_type)}</dd>

                  <Show when={accuracy()}>
                    {(a) => (
                      <>
                        <dt class="text-muted-foreground">
                          {m.search_result_accuracy()}
                        </dt>
                        <dd>{a()}</dd>
                      </>
                    )}
                  </Show>

                  <Show when={category()}>
                    {(cat) => (
                      <>
                        <dt class="text-muted-foreground">
                          {m.search_result_category()}
                        </dt>
                        <dd>{cat()}</dd>
                      </>
                    )}
                  </Show>

                  <Show when={brand()}>
                    {(b) => (
                      <>
                        <dt class="text-muted-foreground">
                          {m.search_result_brand()}
                        </dt>
                        <dd>{b()}</dd>
                      </>
                    )}
                  </Show>

                  <Show when={context().place?.name}>
                    {(name) => (
                      <>
                        <dt class="text-muted-foreground">
                          {m.search_result_place()}
                        </dt>
                        <dd>{name()}</dd>
                      </>
                    )}
                  </Show>

                  <Show when={context().region?.name}>
                    {(name) => (
                      <>
                        <dt class="text-muted-foreground">
                          {m.search_result_region()}
                        </dt>
                        <dd>{name()}</dd>
                      </>
                    )}
                  </Show>

                  <Show when={context().postcode?.name}>
                    {(name) => (
                      <>
                        <dt class="text-muted-foreground">
                          {m.search_result_postcode()}
                        </dt>
                        <dd>{name()}</dd>
                      </>
                    )}
                  </Show>

                  <Show when={context().country?.name}>
                    {(name) => (
                      <>
                        <dt class="text-muted-foreground">
                          {m.search_result_country()}
                        </dt>
                        <dd>{name()}</dd>
                      </>
                    )}
                  </Show>
                </dl>
              </div>

              <Button
                class="mt-2 w-full"
                onClick={() => setIsAddOpen(true)}
              >
                <PlusIcon />
                {m.search_result_add()}
              </Button>

              <AddFromSearchDialog
                isOpen={isAddOpen}
                setIsOpen={setIsAddOpen}
                feature={f()}
              />
            </>
          );
        }}
      </Show>
    </div>
  );
}

export default SearchResultContent;
