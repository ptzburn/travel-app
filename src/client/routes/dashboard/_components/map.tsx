import { useColorMode } from "@kobalte/core";
import CustomMarker from "~/client/routes/dashboard/_components/custom-marker.tsx";
import {
  type MapLocation,
  type MapMode,
  mapMode,
} from "~/client/stores/map-store.ts";
import * as m from "~/paraglide/messages.js";
import type { LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createEffect,
  createMemo,
  For,
  type JSX,
  onCleanup,
  Show,
} from "solid-js";

import { Map, NavigationControl, useMap, useMapEffect } from "solid-maplibre";

const RADIUS_SOURCE_ID = "radius-circle-source";
const RADIUS_FILL_LAYER_ID = "radius-circle-fill";
const RADIUS_LINE_LAYER_ID = "radius-circle-line";

function circlePolygon(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  points = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dLat = (radiusKm / 6371) * Math.cos(angle);
    const dLng = (radiusKm / 6371) *
      Math.sin(angle) /
      Math.cos((centerLat * Math.PI) / 180);
    coords.push([
      centerLng + (dLng * 180) / Math.PI,
      centerLat + (dLat * 180) / Math.PI,
    ]);
  }
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coords] },
  };
}

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

function RadiusCircle(props: {
  lat: number;
  long: number;
  radiusKm: number;
}): JSX.Element {
  const getMap = useMap();

  const geojson = createMemo(() =>
    circlePolygon(props.lat, props.long, props.radiusKm)
  );

  function ensureLayers(map: maplibregl.Map): void {
    if (!map.isStyleLoaded()) return;

    const source = map.getSource(RADIUS_SOURCE_ID);
    if (source && "setData" in source) {
      (source as maplibregl.GeoJSONSource).setData(geojson());
      return;
    }

    map.addSource(RADIUS_SOURCE_ID, {
      type: "geojson",
      data: geojson(),
    });

    map.addLayer({
      id: RADIUS_FILL_LAYER_ID,
      type: "fill",
      source: RADIUS_SOURCE_ID,
      paint: {
        "fill-color": "#3b82f6",
        "fill-opacity": 0.1,
      },
    });

    map.addLayer({
      id: RADIUS_LINE_LAYER_ID,
      type: "line",
      source: RADIUS_SOURCE_ID,
      paint: {
        "line-color": "#3b82f6",
        "line-width": 2,
        "line-dasharray": [2, 2],
      },
    });
  }

  useMapEffect((map) => {
    ensureLayers(map);
  });

  createEffect(() => {
    const map = getMap?.();
    if (!map) return;
    const handler = () => ensureLayers(map);
    map.on("styledata", handler);
    onCleanup(() => map.off("styledata", handler));
  });

  onCleanup(() => {
    const map = getMap?.();
    if (!map) return;
    if (map.getLayer(RADIUS_LINE_LAYER_ID)) {
      map.removeLayer(RADIUS_LINE_LAYER_ID);
    }
    if (map.getLayer(RADIUS_FILL_LAYER_ID)) {
      map.removeLayer(RADIUS_FILL_LAYER_ID);
    }
    if (map.getSource(RADIUS_SOURCE_ID)) map.removeSource(RADIUS_SOURCE_ID);
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

  const radiusData = () => {
    const pm = pickMode();
    if (!pm?.radiusCenter || !pm.radiusKm) return undefined;
    return {
      lat: pm.radiusCenter.lat,
      long: pm.radiusCenter.long,
      radiusKm: pm.radiusKm,
    };
  };

  return (
    <Show when={pickMode()}>
      {(pm) => (
        <>
          <Show when={radiusData()}>
            {(r) => (
              <RadiusCircle
                lat={r().lat}
                long={r().long}
                radiusKm={r().radiusKm}
              />
            )}
          </Show>
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
                  tooltip={m.map_drag_tooltip()}
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
