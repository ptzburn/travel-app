import { createFileUploader } from "@solid-primitives/upload";
import {
  A,
  createAsync,
  revalidate,
  useAction,
  useNavigate,
  useParams,
  useSubmission,
} from "@solidjs/router";
import {
  deleteLocationLogImageAction,
  uploadLocationLogImageAction,
} from "~/client/actions/location-logs.ts";
import { DeletionDialog } from "~/client/components/deletion-dialog.tsx";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/client/components/ui/alert.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/client/components/ui/dialog.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/client/components/ui/empty.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { getFileUrl } from "~/client/lib/utils.ts";
import { getLocationLogByIdQuery } from "~/client/queries/location-logs.ts";
import { LocationLogActions } from "~/client/routes/dashboard/locations/_components/location-log-actions.tsx";
import { setMapMode } from "~/client/stores/map-store.ts";
import ArrowLeftIcon from "~icons/lucide/arrow-left";
import ImageIcon from "~icons/lucide/image";
import ImageUpIcon from "~icons/lucide/image-up";
import InfoIcon from "~icons/lucide/info";
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

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function LocationLogDetailPage(): JSX.Element {
  const params = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
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

  const handleDeleteImage = async (): Promise<void> => {
    const imageId = deletingImageId();
    if (imageId === null) return;

    setIsDeleting(true);
    try {
      await deleteImageAction(params.slug, params.id, String(imageId));
      await revalidate(getLocationLogByIdQuery.key);
      toast.success("Image deleted");
      setIsDeleteOpen(false);
      setDeletingImageId(null);
    } catch (error) {
      toast.error(
        Error.isError(error) ? error.message : "Failed to delete image",
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
        toast.success("Image uploaded successfully");
        clearFiles();
        setIsUploadOpen(false);
      } catch (error) {
        toast.error(
          Error.isError(error) ? error.message : "Failed to upload image",
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
                title="Delete image?"
                description="This will permanently delete this image."
                onDelete={handleDeleteImage}
              />

              <div class="flex items-center gap-3">
                <Button
                  as={A}
                  href={`/dashboard/locations/${params.slug}`}
                  variant="ghost"
                  size="icon"
                >
                  <ArrowLeftIcon />
                </Button>
                <h2 class="truncate">{log().name}</h2>
                <LocationLogActions
                  slug={params.slug}
                  logId={log().id}
                  logName={log().name}
                  onDeleted={() =>
                    navigate(`/dashboard/locations/${params.slug}`)}
                />
              </div>

              <Alert>
                <InfoIcon class="size-4" />
                <AlertTitle>
                  {formatDate(log().startedAt)} &mdash;{" "}
                  {formatDate(log().endedAt)}
                </AlertTitle>
                <Show when={log().description}>
                  {(desc) => <AlertDescription>{desc()}</AlertDescription>}
                </Show>
              </Alert>

              <div>
                <div class="mb-4 flex items-center justify-between">
                  <h3>Images</h3>
                  <Dialog
                    open={isUploadOpen()}
                    onOpenChange={(open) => {
                      setIsUploadOpen(open);
                      if (!open) clearFiles();
                    }}
                  >
                    <DialogTrigger
                      as={Button}
                      variant="outline"
                      size="sm"
                    >
                      <ImageUpIcon class="size-4" />
                      Upload Image
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Image</DialogTitle>
                        <DialogDescription>
                          Select an image to upload for this location log.
                        </DialogDescription>
                      </DialogHeader>
                      <div class="flex flex-col gap-4">
                        <div class="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
                          <Show
                            when={files()[0]?.source}
                            fallback={
                              <p class="text-muted-foreground text-sm">
                                No image selected
                              </p>
                            }
                          >
                            {(source) => (
                              <img
                                src={source()}
                                alt="Upload preview"
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
                          Select Image
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button
                          disabled={!files()[0] || uploadSubmission.pending}
                          onClick={handleUpload}
                        >
                          <Show
                            when={uploadSubmission.pending}
                            fallback="Upload"
                          >
                            Uploading...
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
                    <Empty class="border">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <ImageIcon />
                        </EmptyMedia>
                        <EmptyTitle>No images yet</EmptyTitle>
                        <EmptyDescription>
                          Images will appear here once uploaded.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  }
                >
                  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <For each={log().images}>
                      {(image) => (
                        <div class="group relative overflow-hidden rounded-lg border">
                          <img
                            src={getFileUrl(image.key)}
                            alt={log().name}
                            class="aspect-video w-full object-cover"
                            loading="lazy"
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
                      )}
                    </For>
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
