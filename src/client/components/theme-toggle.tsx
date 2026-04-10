import { useColorMode } from "@kobalte/core";
import { Button } from "~/client/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/client/components/ui/dropdown-menu.tsx";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "~/client/components/ui/toggle-group.tsx";
import * as m from "~/paraglide/messages.js";
import Monitor from "~icons/lucide/monitor";
import Moon from "~icons/lucide/moon";
import Sun from "~icons/lucide/sun";
import type { JSX } from "solid-js";

interface ThemeToggleProps {
  variant?: "dropdown" | "toggle";
}

export function ThemeToggle(props: ThemeToggleProps): JSX.Element {
  const { colorMode, setColorMode } = useColorMode();

  // Toggle group variant for mobile
  if (props.variant === "toggle") {
    return (
      <div class="flex items-center gap-3">
        <span class="font-medium text-sm">{m.theme_label()}</span>
        <ToggleGroup
          value={colorMode()}
          onChange={(value) => {
            if (value) {
              setColorMode(value as "light" | "dark" | "system");
            }
          }}
          variant="outline"
        >
          <ToggleGroupItem value="light" aria-label={m.theme_light()}>
            <Sun class="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label={m.theme_dark()}>
            <Moon class="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="system"
            aria-label={m.theme_system()}
          >
            <Monitor class="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  }

  // Dropdown variant (default) for desktop
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        as={Button<"button">}
        variant="ghost"
        size="sm"
        class="relative w-9 px-0"
      >
        <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">{m.theme_toggle()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onSelect={() => setColorMode("light")}
          class="hover:cursor-pointer"
        >
          <Sun class="size-4" />
          <span>{m.theme_light()}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setColorMode("dark")}
          class="hover:cursor-pointer"
        >
          <Moon class="size-4" />
          <span>{m.theme_dark()}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setColorMode("system")}
          class="hover:cursor-pointer"
        >
          <Monitor class="size-4" />
          <span>{m.theme_system()}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
