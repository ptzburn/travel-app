import { createSignal } from "solid-js";

const [hoveredSlug, setHoveredSlug] = createSignal<string | null>(null);

export { hoveredSlug, setHoveredSlug };
