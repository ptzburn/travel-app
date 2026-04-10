import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/client/components/ui/select.tsx";
import {
  getLocale,
  type Locale,
  locales,
  setLocale,
} from "~/paraglide/runtime.js";
import type { JSX } from "solid-js";

const LOCALE_NAMES: Record<Locale, string> = {
  fi: "Suomi",
  en: "English",
  sv: "Svenska",
  ru: "Русский",
};

export function LanguageSwitcher(): JSX.Element {
  return (
    <Select
      value={getLocale()}
      onChange={(value) => {
        if (value) setLocale(value);
      }}
      options={[...locales]}
      itemComponent={(props) => (
        <SelectItem item={props.item}>
          {LOCALE_NAMES[props.item.rawValue]}
        </SelectItem>
      )}
    >
      <SelectTrigger class="w-[120px]">
        <SelectValue<Locale>>
          {(state) => LOCALE_NAMES[state.selectedOption()]}
        </SelectValue>
      </SelectTrigger>
      <SelectContent />
    </Select>
  );
}
