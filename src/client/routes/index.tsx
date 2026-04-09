import { A } from "@solidjs/router";
import { ThemeToggle } from "~/client/components/theme-toggle.tsx";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/client/components/ui/card.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import ArrowRight from "~icons/lucide/arrow-right";
import CalendarDays from "~icons/lucide/calendar-days";
import Camera from "~icons/lucide/camera";
import Globe from "~icons/lucide/globe";
import MapIcon from "~icons/lucide/map";
import MapPin from "~icons/lucide/map-pin";
import Route from "~icons/lucide/route";
import { For, type JSX } from "solid-js";

const features = [
  {
    icon: MapIcon,
    title: "Interactive Map",
    description:
      "Explore your world on a beautiful, responsive map. Pan, zoom, and discover all your saved places at a glance.",
  },
  {
    icon: MapPin,
    title: "Pin Your Places",
    description:
      "Save locations by dropping a pin on the map. Add names, descriptions, and coordinates for every spot that matters.",
  },
  {
    icon: CalendarDays,
    title: "Log Your Visits",
    description:
      "Record each visit with dates, notes, and exact coordinates. Build a timeline of memories for every location.",
  },
  {
    icon: Camera,
    title: "Photo Journals",
    description:
      "Attach photos to your logs and relive the moments. Upload, browse, and manage your travel gallery.",
  },
  {
    icon: Route,
    title: "Track Your Journey",
    description:
      "See all your visits on the map with custom markers. Hover to highlight, click to dive into the details.",
  },
  {
    icon: Globe,
    title: "Dark & Light Modes",
    description:
      "Switch between light and dark map styles that adapt to your theme preference — day or night.",
  },
];

export default function LandingPage(): JSX.Element {
  return (
    <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header class="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span class="font-semibold text-sm tracking-tight">Travel App</span>
          <div class="flex items-center gap-2">
            <ThemeToggle />
            <Button as={A} href="/auth/sign-in" size="sm">
              Sign in
            </Button>
          </div>
        </div>
      </header>

      <main class="flex flex-1 flex-col">
        <section class="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
          <div class="pointer-events-none absolute inset-0 overflow-hidden">
            <div class="absolute top-1/4 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
            <div class="absolute right-0 bottom-0 size-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <Badge variant="secondary" round>
            Your personal travel companion
          </Badge>

          <div class="relative flex max-w-2xl flex-col gap-4">
            <h1 class="font-bold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
              Map your memories, <span class="text-primary">pin by pin</span>
            </h1>
            <p class="mx-auto max-w-lg text-lg text-muted-foreground">
              Save the places you love, log every visit with photos and notes,
              and watch your personal map come alive.
            </p>
          </div>

          <div class="relative flex flex-wrap items-center justify-center gap-3">
            <Button as={A} href="/auth/sign-in" size="lg">
              Start mapping
              <ArrowRight class="size-4" />
            </Button>
          </div>
        </section>

        <Separator />

        <section class="mx-auto w-full max-w-5xl px-6 py-20">
          <div class="mb-12 text-center">
            <h2 class="font-bold text-2xl tracking-tight sm:text-3xl">
              Everything you need to remember every place
            </h2>
            <p class="mt-2 text-muted-foreground">
              An interactive map, visit logs, and photo journals — all in one
              dashboard.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <For each={features}>
              {(feature) => (
                <Card class="h-full transition-colors hover:border-primary/40">
                  <CardHeader>
                    <div class="mb-2 flex size-10 items-center justify-center rounded-md border bg-muted">
                      <feature.icon class="size-5 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )}
            </For>
          </div>
        </section>

        <Separator />

        <section class="mx-auto w-full max-w-4xl px-6 py-20">
          <div class="mb-12 text-center">
            <h2 class="font-bold text-2xl tracking-tight sm:text-3xl">
              How it works
            </h2>
          </div>

          <div class="grid gap-8 sm:grid-cols-3">
            <div class="flex flex-col items-center gap-3 text-center">
              <div class="flex size-12 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
                1
              </div>
              <h3 class="font-semibold text-lg">Drop a pin</h3>
              <p class="text-muted-foreground text-sm">
                Find a spot on the map and save it as a location with a name and
                description.
              </p>
            </div>

            <div class="flex flex-col items-center gap-3 text-center">
              <div class="flex size-12 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
                2
              </div>
              <h3 class="font-semibold text-lg">Log your visits</h3>
              <p class="text-muted-foreground text-sm">
                Add entries with dates, notes, and photos each time you visit or
                want to remember something.
              </p>
            </div>

            <div class="flex flex-col items-center gap-3 text-center">
              <div class="flex size-12 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
                3
              </div>
              <h3 class="font-semibold text-lg">Explore your map</h3>
              <p class="text-muted-foreground text-sm">
                See all your places and visits on one interactive map. Click any
                marker to dive in.
              </p>
            </div>
          </div>
        </section>

        <Separator />

        <section class="flex flex-col items-center gap-6 px-6 py-20 text-center">
          <h2 class="font-bold text-2xl tracking-tight sm:text-3xl">
            Ready to start pinning?
          </h2>
          <p class="max-w-md text-muted-foreground">
            Sign in and build your personal travel map — one memory at a time.
          </p>
          <Button as={A} href="/auth/sign-in" size="lg">
            Get started
            <ArrowRight class="size-4" />
          </Button>
        </section>

        <footer class="border-t py-6 text-center text-muted-foreground text-sm">
          Built by{" "}
          <a
            href="https://github.com/ptzburn"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            ptzburn
          </a>
        </footer>
      </main>
    </div>
  );
}
