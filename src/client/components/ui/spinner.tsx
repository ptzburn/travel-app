import { cn } from "~/client/lib/utils.ts";
import * as m from "~/paraglide/messages.js";
import LoaderCircle from "~icons/lucide/loader-circle";

import { type Component, type ComponentProps, splitProps } from "solid-js";

const Spinner: Component<ComponentProps<"svg">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <LoaderCircle
      role="status"
      aria-label={m.a11y_loading()}
      class={cn("size-4 animate-spin", local.class)}
      {...others}
    />
  );
};

export { Spinner };
