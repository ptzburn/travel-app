import { createSignal } from "solid-js";

export interface MapLocation {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  lat: number;
  long: number;
  href: string;
}

interface ViewMode {
  mode: "view";
  locations: MapLocation[];
}

interface PickMode {
  mode: "pick";
  lat: number | null;
  long: number | null;
  onPick: (lat: number, long: number) => void;
  center?: { lat: number; long: number };
  zoom?: number;
  locations?: MapLocation[];
}

export type MapMode = ViewMode | PickMode;

const [mapMode, setMapMode] = createSignal<MapMode>({
  mode: "view",
  locations: [],
});

export { mapMode, setMapMode };
