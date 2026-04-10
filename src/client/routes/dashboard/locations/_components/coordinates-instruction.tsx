import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/client/components/ui/alert.tsx";
import * as m from "~/paraglide/messages.js";
import InfoIcon from "~icons/lucide/info";
import type { JSX } from "solid-js";

export function CoordinatesInstruction(): JSX.Element {
  return (
    <Alert class="border-info-foreground text-info-foreground">
      <InfoIcon class="size-4 text-info-foreground!" />
      <AlertTitle>{m.locations_coordinates_title()}</AlertTitle>
      <AlertDescription>
        {m.locations_coordinates_description()}
      </AlertDescription>
    </Alert>
  );
}
