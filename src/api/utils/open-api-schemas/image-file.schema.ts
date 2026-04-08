import { z } from "@hono/zod-openapi";

const ImageFileSchema = z.object({
  file: z.instanceof(Blob)
    .refine(
      (file) => file.type === "image/webp",
      {
        message: "Invalid file type. Only webp images are allowed.",
      },
    )
    .refine(
      (file) => file.size > 0,
      {
        message: "File is empty.",
      },
    )
    .refine(
      (file) => file.size <= 1 * 1024 * 1024, // 1MB
      {
        message: "File too large. Maximum size is 1MB.",
      },
    )
    .openapi({
      type: "string",
      format: "binary",
    }),
});

export default ImageFileSchema;
