import { A } from "@solidjs/router";
import { LanguageSwitcher } from "~/client/components/language-switcher.tsx";
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
import * as m from "~/paraglide/messages.js";
import ArrowRight from "~icons/lucide/arrow-right";
import CalendarDays from "~icons/lucide/calendar-days";
import Camera from "~icons/lucide/camera";
import Globe from "~icons/lucide/globe";
import MapIcon from "~icons/lucide/map";
import MapPin from "~icons/lucide/map-pin";
import Route from "~icons/lucide/route";
import { For, type JSX } from "solid-js";

const features = () => [
  {
    icon: MapIcon,
    title: m.landing_feature_map_title(),
    description: m.landing_feature_map_description(),
  },
  {
    icon: MapPin,
    title: m.landing_feature_pin_title(),
    description: m.landing_feature_pin_description(),
  },
  {
    icon: CalendarDays,
    title: m.landing_feature_log_title(),
    description: m.landing_feature_log_description(),
  },
  {
    icon: Camera,
    title: m.landing_feature_photo_title(),
    description: m.landing_feature_photo_description(),
  },
  {
    icon: Route,
    title: m.landing_feature_track_title(),
    description: m.landing_feature_track_description(),
  },
  {
    icon: Globe,
    title: m.landing_feature_theme_title(),
    description: m.landing_feature_theme_description(),
  },
];

export default function LandingPage(): JSX.Element {
  return (
    <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header class="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div class="flex items-center gap-2">
            <img src="/icon.png" alt="Carte" class="size-7 rounded-md" />
            <span class="font-semibold text-sm tracking-tight">Carte</span>
          </div>
          <div class="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button as={A} href="/auth/sign-in" size="sm">
              {m.landing_sign_in()}
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
            {m.landing_badge()}
          </Badge>

          <div class="relative flex max-w-2xl flex-col gap-4">
            <h1 class="font-bold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
              {m.landing_hero_title()}{" "}
              <span class="text-primary">
                {m.landing_hero_title_highlight()}
              </span>
            </h1>
            <p class="mx-auto max-w-lg text-lg text-muted-foreground">
              {m.landing_hero_description()}
            </p>
          </div>

          <div class="relative flex flex-wrap items-center justify-center gap-3">
            <Button as={A} href="/auth/sign-in" size="lg">
              {m.landing_start_mapping()}
              <ArrowRight class="size-4" />
            </Button>
          </div>
        </section>

        <Separator />

        <section class="mx-auto w-full max-w-5xl px-6 py-20">
          <div class="mb-12 text-center">
            <h2 class="font-bold text-2xl tracking-tight sm:text-3xl">
              {m.landing_features_title()}
            </h2>
            <p class="mt-2 text-muted-foreground">
              {m.landing_features_description()}
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <For each={features()}>
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
              {m.landing_how_it_works()}
            </h2>
          </div>

          <div class="grid gap-8 sm:grid-cols-3">
            <div class="flex flex-col items-center gap-3 text-center">
              <div class="flex size-12 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
                1
              </div>
              <h3 class="font-semibold text-lg">{m.landing_step1_title()}</h3>
              <p class="text-muted-foreground text-sm">
                {m.landing_step1_description()}
              </p>
            </div>

            <div class="flex flex-col items-center gap-3 text-center">
              <div class="flex size-12 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
                2
              </div>
              <h3 class="font-semibold text-lg">{m.landing_step2_title()}</h3>
              <p class="text-muted-foreground text-sm">
                {m.landing_step2_description()}
              </p>
            </div>

            <div class="flex flex-col items-center gap-3 text-center">
              <div class="flex size-12 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
                3
              </div>
              <h3 class="font-semibold text-lg">{m.landing_step3_title()}</h3>
              <p class="text-muted-foreground text-sm">
                {m.landing_step3_description()}
              </p>
            </div>
          </div>
        </section>

        <Separator />

        <section class="flex flex-col items-center gap-6 px-6 py-20 text-center">
          <h2 class="font-bold text-2xl tracking-tight sm:text-3xl">
            {m.landing_cta_title()}
          </h2>
          <p class="max-w-md text-muted-foreground">
            {m.landing_cta_description()}
          </p>
          <Button as={A} href="/auth/sign-in" size="lg">
            {m.landing_get_started()}
            <ArrowRight class="size-4" />
          </Button>
        </section>

        <footer class="border-t py-6 text-center text-muted-foreground text-sm">
          {m.landing_built_by()}{" "}
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
