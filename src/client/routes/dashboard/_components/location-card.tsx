import { A, revalidate, useAction } from "@solidjs/router";
import { deleteLocationAction } from "~/client/actions/locations.ts";
import { DeletionDialog } from "~/client/components/deletion-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/client/components/ui/card.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/client/components/ui/dropdown-menu.tsx";
import { getLocationsQuery } from "~/client/queries/locations.ts";
import { hoveredSlug, setHoveredSlug } from "~/client/stores/location-hover.ts";
import type { LocationResponse } from "~/shared/types/locations.ts";
import EllipsisVertical from "~icons/lucide/ellipsis-vertical";
import Pencil from "~icons/lucide/pencil";
import Trash from "~icons/lucide/trash";
import { createSignal, type JSX, Show } from "solid-js";
import { toast } from "solid-sonner";

export function LocationCard(
  props: { location: LocationResponse },
): JSX.Element {
  const [isDeleteOpen, setIsDeleteOpen] = createSignal(false);
  const [isDeleting, setIsDeleting] = createSignal(false);
  const deleteAction = useAction(deleteLocationAction);

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      await deleteAction(props.location.slug);
      await revalidate(getLocationsQuery.key);
      toast.success("Location deleted");
      setIsDeleteOpen(false);
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
      <Card
        class={`transition-colors ${
          hoveredSlug() === props.location.slug
            ? "border-primary ring-primary/20 ring-2"
            : ""
        }`}
        onMouseEnter={() => setHoveredSlug(props.location.slug)}
        onMouseLeave={() => setHoveredSlug(null)}
      >
        <CardHeader>
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <CardTitle>{props.location.name}</CardTitle>
              <CardDescription>
                {props.location.lat.toFixed(4)},{" "}
                {props.location.long.toFixed(4)}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                as={Button}
                variant="ghost"
                size="icon"
                class="-mt-1 -mr-2 shrink-0"
              >
                <EllipsisVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  as={A}
                  href={`/dashboard/locations/${props.location.slug}/edit`}
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
          </div>
        </CardHeader>
        <Show when={props.location.description}>
          {(desc) => (
            <CardContent>
              <p class="line-clamp-2 text-muted-foreground text-sm">
                {desc()}
              </p>
            </CardContent>
          )}
        </Show>
      </Card>

      <DeletionDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        isPending={isDeleting()}
        title="Delete location?"
        description={`This will permanently delete "${props.location.name}" and all its data.`}
        onDelete={handleDelete}
      />
    </>
  );
}
