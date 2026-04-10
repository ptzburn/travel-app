import { A, revalidate, useAction } from "@solidjs/router";
import { deleteLocationLogAction } from "~/client/actions/location-logs.ts";
import { DeletionDialog } from "~/client/components/deletion-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/client/components/ui/dropdown-menu.tsx";
import { getLocationBySlugQuery } from "~/client/queries/locations.ts";
import * as m from "~/paraglide/messages.js";
import EllipsisVertical from "~icons/lucide/ellipsis-vertical";
import Pencil from "~icons/lucide/pencil";
import Trash from "~icons/lucide/trash";
import { createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

type LocationLogActionsProps = {
  slug: string;
  logId: number;
  logName: string;
  onDeleted?: () => void;
  class?: string;
};

export function LocationLogActions(
  props: LocationLogActionsProps,
): JSX.Element {
  const [isDeleteOpen, setIsDeleteOpen] = createSignal(false);
  const [isDeleting, setIsDeleting] = createSignal(false);
  const deleteAction = useAction(deleteLocationLogAction);

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      await deleteAction(props.slug, String(props.logId));
      await revalidate(getLocationBySlugQuery.key);
      toast.success(m.logs_deleted());
      setIsDeleteOpen(false);
      props.onDeleted?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          as={Button}
          variant="ghost"
          size="icon"
          class={props.class}
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            as={A}
            href={`/dashboard/locations/${props.slug}/${props.logId}/edit`}
          >
            <Pencil class="size-4" />
            {m.common_edit()}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsDeleteOpen(true)}>
            <Trash class="size-4" />
            {m.common_delete()}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeletionDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        isPending={isDeleting()}
        title={m.logs_delete_title()}
        description={m.logs_delete_description({ name: props.logName })}
        onDelete={handleDelete}
      />
    </>
  );
}
