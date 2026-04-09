import { hoveredSlug, setHoveredSlug } from "~/client/stores/location-hover.ts";
import {
  type MapLocation,
  type MapMode,
  mapMode,
} from "~/client/stores/map-store.ts";
import { Marker as MaplibreMarker } from "maplibre-gl";
import type { LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { createEffect, For, type JSX, onCleanup, Show } from "solid-js";
import { render } from "solid-js/web";
import {
  Map,
  Marker,
  NavigationControl,
  useMap,
  useMapEffect,
} from "solid-maplibre";

function FitBounds(props: { locations: MapLocation[] }): JSX.Element {
  const getMap = useMap();

  createEffect(() => {
    const map = getMap?.();
    if (!map || props.locations.length === 0) return;

    const locations = props.locations;

    const frame = requestAnimationFrame(() => {
      map.resize();

      if (locations.length === 1) {
        map.flyTo({ center: [locations[0].long, locations[0].lat], zoom: 10 });
        return;
      }

      const lngs = locations.map((l) => l.long);
      const lats = locations.map((l) => l.lat);
      const bounds: LngLatBoundsLike = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ];
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    });

    onCleanup(() => cancelAnimationFrame(frame));
  });

  return null as unknown as JSX.Element;
}

function FlyToSelected(
  props: { lat: number; long: number },
): JSX.Element {
  useMapEffect((map) => {
    map.flyTo({ center: [props.long, props.lat], zoom: 12 });
  });
  return null as unknown as JSX.Element;
}

function LocationPin(props: { slug: string }): JSX.Element {
  const isHovered = (): boolean => hoveredSlug() === props.slug;

  return (
    <div
      onMouseEnter={() => setHoveredSlug(props.slug)}
      onMouseLeave={() => setHoveredSlug(null)}
      style={{ cursor: "pointer" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class={`transition-all duration-150 ${
          isHovered()
            ? "scale-125 text-red-500 drop-shadow-lg"
            : "text-blue-500"
        }`}
      >
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" fill="white" stroke="white" />
      </svg>
    </div>
  );
}

function LocationMarker(props: { location: MapLocation }): JSX.Element {
  const getMap = useMap();
  let marker: MaplibreMarker | undefined;
  let dispose: (() => void) | undefined;

  createEffect(() => {
    const map = getMap?.();
    if (!map || marker) return;

    const el = document.createElement("div");
    dispose = render(() => <LocationPin slug={props.location.slug} />, el);

    marker = new MaplibreMarker({ element: el, anchor: "bottom" })
      .setLngLat([props.location.long, props.location.lat])
      .addTo(map);
  });

  onCleanup(() => {
    dispose?.();
    marker?.remove();
  });

  return null as unknown as JSX.Element;
}

function ViewModeContent(props: { mode: MapMode }): JSX.Element {
  const viewMode = () => props.mode.mode === "view" ? props.mode : undefined;

  return (
    <Show when={viewMode()}>
      {(vm) => (
        <>
          <FitBounds locations={vm().locations} />
          <For each={vm().locations}>
            {(loc) => <LocationMarker location={loc} />}
          </For>
        </>
      )}
    </Show>
  );
}

function PickModeContent(props: { mode: MapMode }): JSX.Element {
  const pickMode = () => props.mode.mode === "pick" ? props.mode : undefined;

  const coords = (): {
    lat: number;
    long: number;
    onPick: (lat: number, long: number) => void;
  } | undefined => {
    const pm = pickMode();
    if (!pm || pm.lat === null || pm.long === null) return undefined;
    return { lat: pm.lat, long: pm.long, onPick: pm.onPick };
  };

  return (
    <Show when={pickMode()}>
      <Show when={coords()}>
        {(c) => (
          <>
            <FlyToSelected lat={c().lat} long={c().long} />
            <Marker
              position={[c().long, c().lat]}
              draggable
              ondragend={(e) => {
                const lngLat = e.target.getLngLat();
                c().onPick(lngLat.lat, lngLat.lng);
              }}
            />
          </>
        )}
      </Show>
    </Show>
  );
}

export default function UnifiedMap(): JSX.Element {
  const mode = mapMode;

  return (
    <Map
      style={{ width: "100%", height: "100%" }}
      options={{
        style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
        center: [0, 20],
        zoom: 2,
      }}
      cursor={mode().mode === "pick" ? "crosshair" : undefined}
      ondblclick={(e) => {
        const m = mode();
        if (m.mode === "pick") m.onPick(e.lngLat.lat, e.lngLat.lng);
      }}
    >
      <NavigationControl position="top-right" />
      <ViewModeContent mode={mode()} />
      <PickModeContent mode={mode()} />
    </Map>
  );
}
