import { A, revalidate, useAction, useNavigate } from "@solidjs/router";
import { deleteLocationAction } from "~/client/actions/locations.ts";
import { DeletionDialog } from "~/client/components/deletion-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/client/components/ui/dropdown-menu.tsx";
import { getLocationsQuery } from "~/client/queries/locations.ts";
import EllipsisVertical from "~icons/lucide/ellipsis-vertical";
import Pencil from "~icons/lucide/pencil";
import Trash from "~icons/lucide/trash";
import { createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

type LocationActionsProps = {
  slug: string;
  name: string;
  onDeleted?: () => void;
  class?: string;
};

export function LocationActions(props: LocationActionsProps): JSX.Element {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = createSignal(false);
  const [isDeleting, setIsDeleting] = createSignal(false);
  const deleteAction = useAction(deleteLocationAction);

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      await deleteAction(props.slug);
      await revalidate(getLocationsQuery.key);
      toast.success("Location deleted");
      setIsDeleteOpen(false);
      if (props.onDeleted) {
        props.onDeleted();
      } else {
        navigate("/dashboard");
      }
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
            href={`/dashboard/locations/${props.slug}/edit`}
          >
            <Pencil class="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsDeleteOpen(true)}>
            <Trash class="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeletionDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        isPending={isDeleting()}
        title="Delete location?"
        description={`This will permanently delete "${props.name}" and all its data.`}
        onDelete={handleDelete}
      />
    </>
  );
}
