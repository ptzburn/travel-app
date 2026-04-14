import { A } from "@solidjs/router";
import { LocationActions } from "~/client/routes/dashboard/locations/_components/location-actions.tsx";
import { hoveredSlug, setHoveredSlug } from "~/client/stores/location-hover.ts";
import type { LocationResponse } from "~/shared/types/locations.ts";
import { type JSX, Show } from "solid-js";

export function LocationCard(
  props: { location: LocationResponse },
): JSX.Element {
  return (
    <A
      href={`/dashboard/locations/${props.location.slug}`}
      class="group flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-accent/50"
      classList={{
        "bg-accent/30": hoveredSlug() === props.location.slug,
      }}
      onMouseEnter={() => setHoveredSlug(props.location.slug)}
      onMouseLeave={() => setHoveredSlug(null)}
    >
      <div class="min-w-0 flex-1">
        <p class="truncate font-medium text-sm">{props.location.name}</p>
        <Show when={props.location.description}>
          {(desc) => (
            <p class="truncate text-muted-foreground text-xs">{desc()}</p>
          )}
        </Show>
      </div>
      <LocationActions
        slug={props.location.slug}
        name={props.location.name}
        class="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </A>
  );
}
