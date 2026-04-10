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
import ArrowUpDown from "~icons/lucide/arrow-up-down";
import SearchIcon from "~icons/lucide/search";
import XIcon from "~icons/lucide/x";
import { createSignal, type JSX, Show } from "solid-js";

type SortByOption = LocationLogFilters["sortBy"];
type SortDirection = LocationLogFilters["sortDirection"];

type LocationLogSearchProps = {
  onFilterChange: (filters: LocationLogFilters) => void;
};

const sortByOptions: { value: SortByOption; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "startedAt", label: "Start Date" },
  { value: "endedAt", label: "End Date" },
  { value: "createdAt", label: "Date Created" },
  { value: "updatedAt", label: "Date Updated" },
];

const sortDirectionOptions: { value: SortDirection; label: string }[] = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
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
          <TextFieldInput placeholder="Search logs..." class="pl-9" />
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
          options={sortByOptions.map((o) => o.value)}
          placeholder="Sort by"
          itemComponent={(itemProps) => (
            <SelectItem item={itemProps.item}>
              {getLabel(itemProps.item.rawValue, sortByOptions)}
            </SelectItem>
          )}
        >
          <SelectTrigger class="w-[150px]" aria-label="Sort by">
            <ArrowUpDown class="mr-1 size-4 shrink-0 text-muted-foreground" />
            <SelectValue<SortByOption>>
              {(state) => getLabel(state.selectedOption(), sortByOptions)}
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
          options={sortDirectionOptions.map((o) => o.value)}
          placeholder="Direction"
          itemComponent={(itemProps) => (
            <SelectItem item={itemProps.item}>
              {getLabel(itemProps.item.rawValue, sortDirectionOptions)}
            </SelectItem>
          )}
        >
          <SelectTrigger class="w-[140px]" aria-label="Sort direction">
            <SelectValue<SortDirection>>
              {(state) =>
                getLabel(state.selectedOption(), sortDirectionOptions)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent />
        </Select>

        <Show when={hasActiveFilters()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            aria-label="Clear filters"
          >
            <XIcon class="size-4" />
          </Button>
        </Show>
      </div>
    </div>
  );
}
