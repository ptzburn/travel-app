import { Button } from "~/client/components/ui/button.tsx";
import {
  Calendar,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridBodyCell,
  CalendarGridBodyCellTrigger,
  CalendarGridBodyRow,
  CalendarGridHead,
  CalendarGridHeadCell,
  CalendarGridHeadRow,
  CalendarHead,
  CalendarNextTrigger,
  CalendarPrevTrigger,
} from "~/client/components/ui/calendar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/client/components/ui/popover.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/client/components/ui/select.tsx";
import {
  TextField,
  TextFieldDescription,
  TextFieldErrorMessage,
  TextFieldLabel,
} from "~/client/components/ui/text-field.tsx";
import { useFieldContext } from "~/client/hooks/use-app-form.ts";
import CalendarIcon from "~icons/lucide/calendar";
import { Index, type JSX, Show } from "solid-js";

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: new Date(2000, i).toLocaleDateString("en", { month: "short" }),
}));

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => ({
  value: currentYear - i,
  label: String(currentYear - i),
}));

type DatePickerProps = {
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function DatePicker(props: DatePickerProps): JSX.Element {
  const field = useFieldContext<string>();
  const isInvalid = () =>
    field().state.meta.isTouched && !field().state.meta.isValid;

  const dateValue = (): Date | undefined => {
    const v = field().state.value;
    return v ? new Date(v) : undefined;
  };

  return (
    <TextField
      data-invalid={isInvalid()}
      validationState={isInvalid() ? "invalid" : "valid"}
    >
      <Show when={props.label}>
        {(label) => (
          <TextFieldLabel for={field().name}>{label()}</TextFieldLabel>
        )}
      </Show>

      <Popover>
        <PopoverTrigger
          as={Button}
          variant="outline"
          id={field().name}
          data-invalid={isInvalid() ? "" : undefined}
          class="w-full justify-between font-normal data-[invalid]:!border-error-foreground data-[invalid]:!text-error-foreground"
          classList={{ "text-muted-foreground": !field().state.value }}
          disabled={field().form.state.isSubmitting || props.disabled}
        >
          {dateValue()?.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }) ?? (props.placeholder ?? "Select date")}
          <CalendarIcon class="size-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent class="w-auto overflow-hidden p-0">
          <Calendar
            mode="single"
            value={dateValue()}
            onValueChange={(date) => {
              if (date) {
                field().handleChange(date.toISOString());
              }
              field().handleBlur();
            }}
          >
            {(api) => (
              <div class="p-3">
                <CalendarHead>
                  <CalendarPrevTrigger />

                  {/* Month and Year Selects */}
                  <div class="flex items-center gap-1">
                    {/* Month Select */}
                    <Select
                      options={MONTHS}
                      optionValue="value"
                      optionTextValue="label"
                      value={MONTHS.find(
                        (m) => m.value === api.month.getMonth(),
                      )}
                      onChange={(option) => {
                        if (option) {
                          const newDate = new Date(api.month);
                          newDate.setMonth(option.value);
                          api.setMonth(newDate);
                        }
                      }}
                      itemComponent={(itemProps) => (
                        <SelectItem item={itemProps.item}>
                          {itemProps.item.rawValue.label}
                        </SelectItem>
                      )}
                    >
                      <SelectTrigger class="h-8 w-[70px] gap-1 border-input px-2 font-medium text-sm [&>svg]:size-3">
                        <SelectValue<(typeof MONTHS)[0]>>
                          {(state) => state.selectedOption().label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent />
                    </Select>

                    {/* Year Select */}
                    <Select
                      options={YEARS}
                      optionValue="value"
                      optionTextValue="label"
                      value={YEARS.find(
                        (y) => y.value === api.month.getFullYear(),
                      )}
                      onChange={(option) => {
                        if (option) {
                          const newDate = new Date(api.month);
                          newDate.setFullYear(option.value);
                          api.setMonth(newDate);
                        }
                      }}
                      itemComponent={(itemProps) => (
                        <SelectItem item={itemProps.item}>
                          {itemProps.item.rawValue.label}
                        </SelectItem>
                      )}
                    >
                      <SelectTrigger class="h-8 w-[70px] gap-1 border-input px-2 font-medium text-sm [&>svg]:size-3">
                        <SelectValue<(typeof YEARS)[0]>>
                          {(state) => state.selectedOption().label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent />
                    </Select>
                  </div>

                  <CalendarNextTrigger />
                </CalendarHead>

                <CalendarGrid>
                  <CalendarGridHead>
                    <CalendarGridHeadRow>
                      <Index each={api.weekdays}>
                        {(weekDay) => (
                          <CalendarGridHeadCell>
                            {weekDay().toLocaleDateString("en", {
                              weekday: "short",
                            })}
                          </CalendarGridHeadCell>
                        )}
                      </Index>
                    </CalendarGridHeadRow>
                  </CalendarGridHead>
                  <CalendarGridBody>
                    <Index each={api.weeks}>
                      {(week) => (
                        <CalendarGridBodyRow>
                          <Index each={week()}>
                            {(day) => (
                              <CalendarGridBodyCell>
                                <CalendarGridBodyCellTrigger day={day()}>
                                  {day().getDate()}
                                </CalendarGridBodyCellTrigger>
                              </CalendarGridBodyCell>
                            )}
                          </Index>
                        </CalendarGridBodyRow>
                      )}
                    </Index>
                  </CalendarGridBody>
                </CalendarGrid>
              </div>
            )}
          </Calendar>
        </PopoverContent>
      </Popover>

      <Show when={props.description}>
        {(description) => (
          <TextFieldDescription>{description()}</TextFieldDescription>
        )}
      </Show>

      <Show when={isInvalid()}>
        {field().state.meta.errors.length > 0
          ? field().state.meta.errors.map(
            (error) =>
              error?.message && (
                <TextFieldErrorMessage>{error.message}</TextFieldErrorMessage>
              ),
          )
          : null}
      </Show>
    </TextField>
  );
}
