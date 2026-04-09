import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/client/components/ui/alert.tsx";
import InfoIcon from "~icons/lucide/info";
import type { JSX } from "solid-js";

export function CoordinatesInstruction(): JSX.Element {
  return (
    <Alert class="border-info-foreground text-info-foreground">
      <InfoIcon class="size-4 text-info-foreground!" />
      <AlertTitle>How to set coordinates</AlertTitle>
      <AlertDescription>
        Drag the marker to your desired destination, or double-click a point on
        the map to place it there. You can also use the search bar to find a
        place.
      </AlertDescription>
    </Alert>
  );
}
