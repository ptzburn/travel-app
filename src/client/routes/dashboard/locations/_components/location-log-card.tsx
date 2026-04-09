import { A } from "@solidjs/router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/client/components/ui/card.tsx";
import { LocationLogActions } from "~/client/routes/dashboard/locations/_components/location-log-actions.tsx";
import { hoveredSlug, setHoveredSlug } from "~/client/stores/location-hover.ts";
import { type JSX, Show } from "solid-js";

type LocationLog = {
  id: number;
  name: string;
  description: string | null;
  startedAt: string;
  endedAt: string;
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function LocationLogCard(
  props: { slug: string; log: LocationLog },
): JSX.Element {
  const logSlug = `log-${props.log.id}`;

  return (
    <A
      href={`/dashboard/locations/${props.slug}/${props.log.id}`}
      class="block h-full"
    >
      <Card
        class={`h-full transition-colors hover:bg-accent/50 ${
          hoveredSlug() === logSlug
            ? "border-primary ring-primary/20 ring-2"
            : ""
        }`}
        onMouseEnter={() => setHoveredSlug(logSlug)}
        onMouseLeave={() => setHoveredSlug(null)}
      >
        <CardHeader>
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <CardTitle>{props.log.name}</CardTitle>
              <CardDescription>
                {formatDate(props.log.startedAt)} &mdash;{" "}
                {formatDate(props.log.endedAt)}
              </CardDescription>
            </div>
            <LocationLogActions
              slug={props.slug}
              logId={props.log.id}
              logName={props.log.name}
              class="-mt-1 -mr-2 shrink-0"
            />
          </div>
        </CardHeader>
        <Show when={props.log.description}>
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
