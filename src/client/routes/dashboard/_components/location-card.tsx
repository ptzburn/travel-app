import { A } from "@solidjs/router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/client/components/ui/card.tsx";
import { LocationActions } from "~/client/routes/dashboard/locations/_components/location-actions.tsx";
import { hoveredSlug, setHoveredSlug } from "~/client/stores/location-hover.ts";
import type { LocationResponse } from "~/shared/types/locations.ts";
import { type JSX, Show } from "solid-js";

export function LocationCard(
  props: { location: LocationResponse },
): JSX.Element {
  return (
    <A href={`/dashboard/locations/${props.location.slug}`} class="contents">
      <Card
        class={`cursor-pointer transition-colors hover:bg-accent/50 ${
          hoveredSlug() === props.location.slug
            ? "border-primary ring-primary/20 ring-2"
            : ""
        }`}
        onMouseEnter={() =>
          setHoveredSlug(props.location.slug)}
        onMouseLeave={() =>
          setHoveredSlug(null)}
      >
        <CardHeader>
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <CardTitle>{props.location.name}</CardTitle>
            </div>
            <LocationActions
              slug={props.location.slug}
              name={props.location.name}
              class="-mt-1 -mr-2 shrink-0"
            />
          </div>
        </CardHeader>
        <Show when={props.location.description}>
          {(desc) => (
            <CardContent>
              <p class="line-clamp-2 text-muted-foreground text-sm">
                {desc()}
              </p>
            </CardContent>
          )}
        </Show>
      </Card>
    </A>
  );
}
