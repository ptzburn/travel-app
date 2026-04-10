import DrawerPrimitive from "@corvu/drawer";
import { mapMode } from "~/client/stores/map-store.ts";
import { createEffect, type JSX } from "solid-js";

const COLLAPSED = 0.1;
const EXPANDED = 1;

type MobileMapSheetProps = {
  children: JSX.Element;
  isEditRoute: boolean;
};

export default function MobileMapSheet(
  props: MobileMapSheetProps,
): JSX.Element {
  return (
    <DrawerPrimitive
      open
      onOpenChange={() => {}}
      modal={false}
      side="bottom"
      snapPoints={[COLLAPSED, EXPANDED]}
      defaultSnapPoint={EXPANDED}
      closeOnEscapeKeyDown={false}
      trapFocus={false}
      preventScroll={false}
    >
      {(drawerProps) => {
        createEffect(() => {
          if (mapMode().mode === "pick") {
            drawerProps.setActiveSnapPoint(COLLAPSED);
          } else if (props.isEditRoute) {
            drawerProps.setActiveSnapPoint(EXPANDED);
          }
        });

        return (
          <DrawerPrimitive.Portal>
            <DrawerPrimitive.Content
              class="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-xl border-t bg-background shadow-lg data-transitioning:transition-transform data-transitioning:duration-300"
              style={{ "max-height": "calc(100dvh - 3.5rem)" }}
            >
              <div class="mx-auto mt-2 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
              <div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 pt-2 pb-6">
                {props.children}
              </div>
            </DrawerPrimitive.Content>
          </DrawerPrimitive.Portal>
        );
      }}
    </DrawerPrimitive>
  );
}
