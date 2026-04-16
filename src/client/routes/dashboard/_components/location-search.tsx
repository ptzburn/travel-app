import {
  TextField,
  TextFieldInput,
} from "~/client/components/ui/text-field.tsx";
import {
  defaultLocationFilters,
  type LocationFilters,
} from "~/client/stores/location-filters.ts";
import * as m from "~/paraglide/messages.js";
import SearchIcon from "~icons/lucide/search";
import { createSignal, type JSX } from "solid-js";

type LocationSearchProps = {
  onFilterChange: (filters: LocationFilters) => void;
};

export function LocationSearch(props: LocationSearchProps): JSX.Element {
  const [search, setSearch] = createSignal(defaultLocationFilters.search);

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  const handleSearchInput = (value: string) => {
    setSearch(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      props.onFilterChange({ search: search() });
    }, 300);
  };

  return (
    <TextField class="flex-1" value={search()} onChange={handleSearchInput}>
      <div class="relative">
        <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <TextFieldInput
          placeholder={m.locations_search_placeholder()}
          class="h-8 pl-9 text-sm"
        />
      </div>
    </TextField>
  );
}
