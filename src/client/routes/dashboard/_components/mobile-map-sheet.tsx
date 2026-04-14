import { Drawer, DrawerPortal } from "~/client/components/ui/drawer.tsx";
import { mapMode } from "~/client/stores/map-store.ts";
import ChevronDown from "~icons/lucide/chevron-down";
import { createEffect, createSignal, type JSX } from "solid-js";

const COLLAPSED = 0.2;
const EXPANDED = 1;

type MobileMapSheetProps = {
  children: JSX.Element;
};

export default function MobileMapSheet(
  props: MobileMapSheetProps,
): JSX.Element {
  const [expanded, setExpanded] = createSignal(true);
  const [animating, setAnimating] = createSignal(false);

  return (
    <Drawer
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
        const animateToSnapPoint = (snapPoint: number) => {
          setAnimating(true);
          drawerProps.setActiveSnapPoint(snapPoint);
          setTimeout(() => setAnimating(false), 300);
        };

        createEffect(() => {
          if (mapMode().mode === "pick") {
            animateToSnapPoint(COLLAPSED);
            setExpanded(false);
          } else {
            animateToSnapPoint(EXPANDED);
            setExpanded(true);
          }
        });

        const toggle = () => {
          const next = !expanded();
          setExpanded(next);
          animateToSnapPoint(next ? EXPANDED : COLLAPSED);
        };

        return (
          <DrawerPortal>
            <Drawer.Content
              class="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-xl border-t bg-background shadow-lg data-transitioning:transition-transform data-transitioning:duration-300"
              classList={{ "transition-transform duration-300": animating() }}
              style={{ "max-height": "calc(100dvh - 3.5rem)" }}
            >
              <button
                type="button"
                onClick={toggle}
                class="flex w-full shrink-0 cursor-pointer items-center justify-center py-2"
              >
                <ChevronDown
                  class="size-5 text-muted-foreground transition-transform duration-200"
                  classList={{ "rotate-180": !expanded() }}
                />
              </button>
              <div class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-4 pt-0 pb-6">
                {props.children}
              </div>
            </Drawer.Content>
          </DrawerPortal>
        );
      }}
    </Drawer>
  );
}
