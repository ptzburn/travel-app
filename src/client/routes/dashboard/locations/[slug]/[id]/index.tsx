import { createFileUploader } from "@solid-primitives/upload";
import {
  createAsync,
  revalidate,
  useAction,
  useParams,
  useSubmission,
} from "@solidjs/router";
import {
  deleteLocationLogImageAction,
  uploadLocationLogImageAction,
} from "~/client/actions/location-logs.ts";
import { DeletionDialog } from "~/client/components/deletion-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/client/components/ui/carousel.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/client/components/ui/dialog.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/client/components/ui/empty.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { TooltipButton } from "~/client/components/ui/tooltip-button.tsx";
import { getFileUrl } from "~/client/lib/utils.ts";
import { getLocationLogByIdQuery } from "~/client/queries/location-logs.ts";
import { setMapMode } from "~/client/stores/map-store.ts";
import * as m from "~/paraglide/messages.js";
import LucideCirclePlus from "~icons/lucide/circle-plus";
import ImageIcon from "~icons/lucide/image";
import ImageUpIcon from "~icons/lucide/image-up";
import TrashIcon from "~icons/lucide/trash";
import {
  createEffect,
  createSignal,
  For,
  type JSX,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import { toast } from "solid-sonner";

export default function LocationLogDetailPage(): JSX.Element {
  const params = useParams<{ slug: string; id: string }>();
  const locationLog = createAsync(() =>
    getLocationLogByIdQuery(params.slug, params.id)
  );

  const { files, selectFiles, clearFiles } = createFileUploader({
    multiple: false,
    accept: "image/*",
  });
  const uploadAction = useAction(uploadLocationLogImageAction);
  const uploadSubmission = useSubmission(uploadLocationLogImageAction);
  const deleteImageAction = useAction(deleteLocationLogImageAction);
  const [isUploadOpen, setIsUploadOpen] = createSignal(false);
  const [deletingImageId, setDeletingImageId] = createSignal<number | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = createSignal(false);
  const [isDeleting, setIsDeleting] = createSignal(false);
  const [viewingImageIndex, setViewingImageIndex] = createSignal<number | null>(
    null,
  );

  const handleDeleteImage = async (): Promise<void> => {
    const imageId = deletingImageId();
    if (imageId === null) return;

    setIsDeleting(true);
    try {
      await deleteImageAction(params.slug, params.id, String(imageId));
      await revalidate(getLocationLogByIdQuery.key);
      toast.success(m.images_deleted());
      setIsDeleteOpen(false);
      setDeletingImageId(null);
    } catch (error) {
      toast.error(
        Error.isError(error) ? error.message : m.images_delete_failed(),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectFile = () => {
    selectFiles(() => {});
  };

  const handleUpload = () => {
    const selected = files()[0];
    if (!selected) return;

    const img = new Image();
    img.onload = async () => {
      const width = Math.min(1000, img.width);
      const resized = await createImageBitmap(img, { resizeWidth: width });
      const canvas = new OffscreenCanvas(width, resized.height);
      canvas.getContext("bitmaprenderer")?.transferFromImageBitmap(resized);
      const blob = await canvas.convertToBlob({
        type: "image/webp",
        quality: 0.9,
      });
      URL.revokeObjectURL(img.src);

      try {
        await uploadAction(params.slug, params.id, blob);
        await revalidate(getLocationLogByIdQuery.key);
        toast.success(m.images_uploaded());
        clearFiles();
        setIsUploadOpen(false);
      } catch (error) {
        toast.error(
          Error.isError(error) ? error.message : m.images_upload_failed(),
        );
      }
    };
    img.src = selected.source;
  };

  createEffect(() => {
    const log = locationLog();
    if (!log) return;

    setMapMode({
      mode: "view",
      locations: [{
        id: log.id,
        name: log.name,
        slug: `log-${log.id}`,
        description: log.description,
        lat: log.lat,
        long: log.long,
        href: `/dashboard/locations/${params.slug}/${log.id}`,
      }],
    });
  });

  onCleanup(() => setMapMode({ mode: "view", locations: [] }));

  return (
    <div class="flex min-h-0 flex-1 flex-col gap-6">
      <Suspense
        fallback={
          <div class="flex flex-1 items-center justify-center">
            <Spinner class="size-8" />
          </div>
        }
      >
        <Show when={locationLog()}>
          {(log) => (
            <>
              <DeletionDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                isPending={isDeleting()}
                title={m.images_delete_title()}
                description={m.images_delete_description()}
                onDelete={handleDeleteImage}
              />
              <Dialog
                open={viewingImageIndex() !== null}
                onOpenChange={(open) => {
                  if (!open) setViewingImageIndex(null);
                }}
              >
                <DialogContent class="max-w-4xl overflow-hidden p-0">
                  <div class="px-12 py-6">
                    <Carousel
                      opts={{
                        loop: true,
                        startIndex: viewingImageIndex() ?? 0,
                      }}
                    >
                      <CarouselContent>
                        <For each={log().images}>
                          {(image) => (
                            <CarouselItem>
                              <img
                                src={getFileUrl(image.key)}
                                alt={log().name}
                                class="max-h-[80vh] w-full rounded-lg object-contain"
                              />
                            </CarouselItem>
                          )}
                        </For>
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                </DialogContent>
              </Dialog>
              <div>
                <div class="mb-4 flex items-center justify-between">
                  <h2>{m.images_title({ name: log().name })}</h2>
                  <TooltipButton
                    tooltip={m.images_upload()}
                    size="icon-lg"
                    variant="ghost"
                    onClick={() => setIsUploadOpen(true)}
                  >
                    <LucideCirclePlus class="size-5" />
                    <span class="sr-only">{m.images_upload()}</span>
                  </TooltipButton>
                  <Dialog
                    open={isUploadOpen()}
                    onOpenChange={(open) => {
                      setIsUploadOpen(open);
                      if (!open) clearFiles();
                    }}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{m.images_upload_title()}</DialogTitle>
                        <DialogDescription>
                          {m.images_upload_description()}
                        </DialogDescription>
                      </DialogHeader>
                      <div class="flex flex-col gap-4">
                        <div class="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
                          <Show
                            when={files()[0]?.source}
                            fallback={
                              <p class="text-muted-foreground text-sm">
                                {m.images_no_selection()}
                              </p>
                            }
                          >
                            {(source) => (
                              <img
                                src={source()}
                                alt={m.images_upload_preview_alt()}
                                class="h-full w-full object-contain"
                              />
                            )}
                          </Show>
                          <Show when={uploadSubmission.pending}>
                            <div class="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Spinner class="text-white" />
                            </div>
                          </Show>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleSelectFile}
                          disabled={uploadSubmission.pending}
                        >
                          {m.images_select()}
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button
                          disabled={!files()[0] || uploadSubmission.pending}
                          onClick={handleUpload}
                        >
                          <Show
                            when={uploadSubmission.pending}
                            fallback={m.images_upload_button()}
                          >
                            {m.images_uploading()}
                          </Show>
                          <ImageUpIcon class="size-4" />
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Show
                  when={log().images.length > 0}
                  fallback={
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <ImageIcon />
                        </EmptyMedia>
                        <EmptyTitle>{m.images_empty_title()}</EmptyTitle>
                        <EmptyDescription>
                          {m.images_empty_description()}
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsUploadOpen(true)}
                        >
                          <ImageUpIcon class="size-4" />
                          {m.images_upload()}
                        </Button>
                      </EmptyContent>
                    </Empty>
                  }
                >
                  <div class="mx-auto w-full px-12">
                    <Carousel opts={{ loop: true }}>
                      <CarouselContent>
                        <For each={log().images}>
                          {(image, index) => (
                            <CarouselItem class="md:basis-1/2 lg:basis-1/3">
                              <div class="group relative overflow-hidden rounded-lg border">
                                <img
                                  src={getFileUrl(image.key)}
                                  alt={log().name}
                                  class="aspect-video w-full cursor-pointer object-cover"
                                  loading="lazy"
                                  onClick={() => setViewingImageIndex(index())}
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  class="absolute top-2 right-2 size-8 opacity-0 transition-opacity group-hover:opacity-100"
                                  onClick={() => {
                                    setDeletingImageId(image.id);
                                    setIsDeleteOpen(true);
                                  }}
                                >
                                  <TrashIcon class="size-4" />
                                </Button>
                              </div>
                            </CarouselItem>
                          )}
                        </For>
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                </Show>
              </div>
            </>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
