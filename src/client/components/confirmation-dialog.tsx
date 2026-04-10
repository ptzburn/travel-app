import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/client/components/ui/alert-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/client/components/ui/drawer.tsx";
import { useMediaQuery } from "~/client/hooks/use-media-query.ts";
import * as m from "~/paraglide/messages.js";
import { type Accessor, type JSX, type Setter, Show } from "solid-js";

type ConfirmationDialogProps = {
  open: Accessor<boolean>;
  onOpenChange: Setter<boolean>;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export function ConfirmationDialog(
  props: ConfirmationDialogProps,
): JSX.Element {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleCancel = () => {
    props.onCancel?.();
    props.onOpenChange(false);
  };

  const handleConfirm = () => {
    props.onConfirm();
    props.onOpenChange(false);
  };

  const defaultTitle = m.dialog_discard_title();
  const defaultDescription = m.dialog_discard_description();
  const defaultConfirmText = m.dialog_discard_confirm();
  const defaultCancelText = m.dialog_discard_cancel();

  return (
    <Show
      when={isDesktop()}
      fallback={
        <Drawer
          open={props.open()}
          onOpenChange={props.onOpenChange}
        >
          <DrawerContent>
            <DrawerHeader class="text-left">
              <DrawerTitle>
                {props.title ?? defaultTitle}
              </DrawerTitle>
              <DrawerDescription>
                {props.description ?? defaultDescription}
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter class="pt-2">
              <Button onClick={handleConfirm}>
                {props.confirmText ?? defaultConfirmText}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                {props.cancelText ?? defaultCancelText}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      }
    >
      <AlertDialog open={props.open()} onOpenChange={props.onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {props.title ?? defaultTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {props.description ?? defaultDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {props.cancelText ?? defaultCancelText}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {props.confirmText ?? defaultConfirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Show>
  );
}
