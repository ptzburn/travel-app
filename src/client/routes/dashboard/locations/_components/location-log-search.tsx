import { Button } from "~/client/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/client/components/ui/select.tsx";
import {
  TextField,
  TextFieldInput,
} from "~/client/components/ui/text-field.tsx";
import {
  defaultLocationLogFilters,
  type LocationLogFilters,
} from "~/client/stores/location-log-filters.ts";
import * as m from "~/paraglide/messages.js";
import ArrowUpDown from "~icons/lucide/arrow-up-down";
import SearchIcon from "~icons/lucide/search";
import XIcon from "~icons/lucide/x";
import { createSignal, type JSX, Show } from "solid-js";

type SortByOption = LocationLogFilters["sortBy"];
type SortDirection = LocationLogFilters["sortDirection"];

type LocationLogSearchProps = {
  onFilterChange: (filters: LocationLogFilters) => void;
};

const getSortByOptions = (): { value: SortByOption; label: string }[] => [
  { value: "name", label: m.locations_sort_name() },
  { value: "startedAt", label: m.logs_sort_start_date() },
  { value: "endedAt", label: m.logs_sort_end_date() },
  { value: "createdAt", label: m.locations_sort_date_created() },
  { value: "updatedAt", label: m.locations_sort_date_updated() },
];

const getSortDirectionOptions = (): {
  value: SortDirection;
  label: string;
}[] => [
  { value: "asc", label: m.locations_sort_ascending() },
  { value: "desc", label: m.locations_sort_descending() },
];

const defaultFilters = defaultLocationLogFilters;

const getLabel = (
  value: string,
  options: { value: string; label: string }[],
) => options.find((o) => o.value === value)?.label ?? value;

export function LocationLogSearch(props: LocationLogSearchProps): JSX.Element {
  const [search, setSearch] = createSignal(defaultFilters.search);
  const [sortBy, setSortBy] = createSignal<SortByOption>(defaultFilters.sortBy);
  const [sortDirection, setSortDirection] = createSignal<SortDirection>(
    defaultFilters.sortDirection,
  );

  const hasActiveFilters = () =>
    search() !== defaultFilters.search ||
    sortBy() !== defaultFilters.sortBy ||
    sortDirection() !== defaultFilters.sortDirection;

  const emit = () => {
    props.onFilterChange({
      search: search(),
      sortBy: sortBy(),
      sortDirection: sortDirection(),
    });
  };

  const handleClear = () => {
    setSearch(defaultFilters.search);
    setSortBy(defaultFilters.sortBy);
    setSortDirection(defaultFilters.sortDirection);
    props.onFilterChange(defaultFilters);
  };

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  const handleSearchInput = (value: string) => {
    setSearch(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      emit();
    }, 300);
  };

  return (
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
      <TextField class="flex-1" value={search()} onChange={handleSearchInput}>
        <div class="relative">
          <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <TextFieldInput
            placeholder={m.logs_search_placeholder()}
            class="pl-9"
          />
        </div>
      </TextField>

      <div class="flex items-end gap-2">
        <Select
          value={sortBy()}
          onChange={(value) => {
            if (value) {
              setSortBy(value);
              emit();
            }
          }}
          options={getSortByOptions().map((o) => o.value)}
          placeholder={m.locations_sort_by()}
          itemComponent={(itemProps) => (
            <SelectItem item={itemProps.item}>
              {getLabel(itemProps.item.rawValue, getSortByOptions())}
            </SelectItem>
          )}
        >
          <SelectTrigger class="w-[150px]" aria-label={m.locations_sort_by()}>
            <ArrowUpDown class="mr-1 size-4 shrink-0 text-muted-foreground" />
            <SelectValue<SortByOption>>
              {(state) => getLabel(state.selectedOption(), getSortByOptions())}
            </SelectValue>
          </SelectTrigger>
          <SelectContent />
        </Select>

        <Select
          value={sortDirection()}
          onChange={(value) => {
            if (value) {
              setSortDirection(value);
              emit();
            }
          }}
          options={getSortDirectionOptions().map((o) => o.value)}
          placeholder={m.locations_sort_direction()}
          itemComponent={(itemProps) => (
            <SelectItem item={itemProps.item}>
              {getLabel(itemProps.item.rawValue, getSortDirectionOptions())}
            </SelectItem>
          )}
        >
          <SelectTrigger
            class="w-[140px]"
            aria-label={m.locations_sort_direction()}
          >
            <SelectValue<SortDirection>>
              {(state) =>
                getLabel(state.selectedOption(), getSortDirectionOptions())}
            </SelectValue>
          </SelectTrigger>
          <SelectContent />
        </Select>

        <Show when={hasActiveFilters()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            aria-label={m.locations_clear_filters()}
          >
            <XIcon class="size-4" />
          </Button>
        </Show>
      </div>
    </div>
  );
}
