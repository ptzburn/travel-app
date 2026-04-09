import { useNavigate } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/client/components/ui/tooltip.tsx";
import { hoveredSlug, setHoveredSlug } from "~/client/stores/location-hover.ts";
import TablerMapPinFilled from "~icons/tabler/map-pin-filled";
import { Marker as MaplibreMarker, Popup } from "maplibre-gl";
import {
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  Show,
} from "solid-js";
import { render } from "solid-js/web";
import { useMap } from "solid-maplibre";

function LocationPin(
  props: {
    slug: string;
    name?: string;
    color?: string;
    tooltip?: string;
    isPopupOpen?: boolean;
  },
): JSX.Element {
  const isHovered = (): boolean => hoveredSlug() === props.slug;

  const pin = (
    <div
      onMouseEnter={() => setHoveredSlug(props.slug)}
      onMouseLeave={() => setHoveredSlug(null)}
      style={{ cursor: "pointer" }}
    >
      <TablerMapPinFilled
        width="30"
        height="30"
        class={`transition-all duration-150 ${
          isHovered()
            ? "scale-125 text-red-500 drop-shadow-lg"
            : (props.color ?? "text-blue-500")
        }`}
      />
    </div>
  );

  if (props.tooltip) {
    return (
      <Tooltip open>
        <TooltipTrigger as="div">{pin}</TooltipTrigger>
        <TooltipContent>{props.tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  if (props.name) {
    return (
      <Tooltip open={isHovered() && !props.isPopupOpen}>
        <TooltipTrigger as="div">{pin}</TooltipTrigger>
        <TooltipContent>{props.name}</TooltipContent>
      </Tooltip>
    );
  }

  return pin;
}

export default function CustomMarker(props: {
  lat: number;
  long: number;
  slug?: string;
  name?: string;
  description?: string | null;
  href?: string;
  color?: string;
  tooltip?: string;
  draggable?: boolean;
  onDragEnd?: (lat: number, long: number) => void;
}): JSX.Element {
  const getMap = useMap();
  const navigate = useNavigate();
  let marker: MaplibreMarker | undefined;
  let dispose: (() => void) | undefined;
  const [isPopupOpen, setIsPopupOpen] = createSignal(false);

  createEffect(() => {
    const map = getMap?.();
    if (!map || marker) return;

    const el = document.createElement("div");
    dispose = render(
      () => (
        <LocationPin
          slug={props.slug ?? "__pick__"}
          name={props.name}
          color={props.color}
          tooltip={props.tooltip}
          isPopupOpen={isPopupOpen()}
        />
      ),
      el,
    );

    if (props.href && props.name) {
      el.addEventListener("click", () => setIsPopupOpen((prev) => !prev));
    }

    marker = new MaplibreMarker({
      element: el,
      anchor: "bottom",
      draggable: props.draggable ?? false,
    })
      .setLngLat([props.long, props.lat])
      .addTo(map);

    const onDragEnd = props.onDragEnd;
    if (props.draggable && onDragEnd) {
      const m = marker;
      m.on("dragend", () => {
        const lngLat = m.getLngLat();
        onDragEnd(lngLat.lat, lngLat.lng);
      });
    }
  });

  createEffect(() => {
    const map = getMap?.();
    if (!map || !isPopupOpen() || !props.name || !props.href) return;

    const href = props.href;
    const container = document.createElement("div");
    const disposePopup = render(
      () => (
        <div class="flex flex-col gap-1">
          <h3 class="font-semibold text-sm">{props.name}</h3>
          <Show when={props.description}>
            {(desc) => (
              <p class="line-clamp-2 text-muted-foreground text-xs">{desc()}</p>
            )}
          </Show>
          <div class="mt-1 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => navigate(href)}>
              View
            </Button>
          </div>
        </div>
      ),
      container,
    );

    const popup = new Popup({
      className: "map-popup",
      offset: 30,
      closeOnClick: false,
      closeOnMove: false,
      closeButton: true,
    })
      .setLngLat([props.long, props.lat])
      .setDOMContent(container)
      .addTo(map);

    popup.on("close", () => setIsPopupOpen(false));

    onCleanup(() => {
      disposePopup();
      popup.remove();
    });
  });

  createEffect(() => {
    marker?.setLngLat([props.long, props.lat]);
  });

  onCleanup(() => {
    dispose?.();
    marker?.remove();
  });

  return;
}
