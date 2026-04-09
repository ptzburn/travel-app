import { useColorMode } from "@kobalte/core";
import CustomMarker from "~/client/routes/dashboard/_components/custom-marker.tsx";
import {
  type MapLocation,
  type MapMode,
  mapMode,
} from "~/client/stores/map-store.ts";
import type { LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createEffect, For, type JSX, onCleanup, Show } from "solid-js";

import { Map, NavigationControl, useMap, useMapEffect } from "solid-maplibre";

const LIGHT_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const DARK_STYLE = "/styles/dark.json";

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

  return;
}

function FlyToSelected(
  props: { lat: number; long: number; zoom?: number },
): JSX.Element {
  const getMap = useMap();

  createEffect(() => {
    const map = getMap?.();
    if (!map) return;

    const frame = requestAnimationFrame(() => {
      map.resize();
      map.flyTo({ center: [props.long, props.lat], zoom: props.zoom ?? 12 });
    });

    onCleanup(() => cancelAnimationFrame(frame));
  });

  return;
}

function ViewModeContent(props: { mode: MapMode }): JSX.Element {
  const viewMode = () => props.mode.mode === "view" ? props.mode : undefined;

  return (
    <Show when={viewMode()}>
      {(vm) => (
        <>
          <FitBounds locations={vm().locations} />
          <For each={vm().locations}>
            {(loc) => (
              <CustomMarker
                lat={loc.lat}
                long={loc.long}
                slug={loc.slug}
                name={loc.name}
                description={loc.description}
                href={loc.href}
              />
            )}
          </For>
        </>
      )}
    </Show>
  );
}

function MapThemeStyle(): JSX.Element {
  const { colorMode } = useColorMode();
  useMapEffect((map) => {
    map.setStyle(colorMode() === "dark" ? DARK_STYLE : LIGHT_STYLE);
  });
  return;
}

function PickModeContent(props: { mode: MapMode }): JSX.Element {
  const pickMode = () => props.mode.mode === "pick" ? props.mode : undefined;

  const coords = (): {
    lat: number;
    long: number;
    zoom: number | undefined;
    onPick: (lat: number, long: number) => void;
  } | undefined => {
    const pm = pickMode();
    if (!pm || pm.lat === null || pm.long === null) return undefined;
    return { lat: pm.lat, long: pm.long, zoom: pm.zoom, onPick: pm.onPick };
  };

  const centerOnly = () => {
    const pm = pickMode();
    if (!pm || pm.lat !== null || !pm.center) return undefined;
    return { ...pm.center, zoom: pm.zoom };
  };

  return (
    <Show when={pickMode()}>
      {(pm) => (
        <>
          <For each={pm().locations ?? []}>
            {(loc) => (
              <CustomMarker
                lat={loc.lat}
                long={loc.long}
                slug={loc.slug}
                name={loc.name}
                description={loc.description}
                href={loc.href}
              />
            )}
          </For>
          <Show when={centerOnly()}>
            {(c) => (
              <FlyToSelected lat={c().lat} long={c().long} zoom={c().zoom} />
            )}
          </Show>
          <Show when={coords()}>
            {(c) => (
              <>
                <FlyToSelected lat={c().lat} long={c().long} zoom={c().zoom} />
                <CustomMarker
                  lat={c().lat}
                  long={c().long}
                  color="text-emerald-500"
                  tooltip="Drag to your desired destination"
                  draggable
                  onDragEnd={c().onPick}
                />
              </>
            )}
          </Show>
        </>
      )}
    </Show>
  );
}

export default function UnifiedMap(): JSX.Element {
  const mode = mapMode;
  const { colorMode } = useColorMode();

  return (
    <Map
      style={{ width: "100%", height: "100%" }}
      options={{
        style: colorMode() === "dark" ? DARK_STYLE : LIGHT_STYLE,
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
      <MapThemeStyle />
      <ViewModeContent mode={mode()} />
      <PickModeContent mode={mode()} />
    </Map>
  );
}
