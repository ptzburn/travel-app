import { createRoute, z } from "@hono/zod-openapi";

import { notFoundSchema } from "~/api/lib/constants.ts";
import authMiddleware from "~/api/middlewares/auth.middleware.ts";
import jsonContent from "~/api/utils/json-content.ts";

import multipartContent from "~/api/utils/multipart-content.ts";
import createErrorSchema from "~/api/utils/open-api-schemas/create-error.schema.ts";
import forbiddenSchema from "~/api/utils/open-api-schemas/forbidden.schema.ts";
import ImageFileSchema from "~/api/utils/open-api-schemas/image-file.schema.ts";
import serverErrorSchema from "~/api/utils/open-api-schemas/server-error.schema.ts";
import SlugIdParamsSchema from "~/api/utils/open-api-schemas/slug-id-params.schema.ts";
import unauthorizedSchema from "~/api/utils/open-api-schemas/unauthorized.schema.ts";
import * as HttpStatus from "~/shared/http-status.ts";

const tags = ["Files"];

export const uploadUserAvatar = createRoute({
  summary: "uploads user avatar",
  description: "Upload user avatar",
  tags,
  method: "post",
  path: "/avatars",
  middleware: [authMiddleware],
  request: {
    body: multipartContent(
      ImageFileSchema,
      "Image file to upload",
    ),
  },
  responses: {
    [HttpStatus.OK.CODE]: jsonContent(
      z.object({
        fileKey: z.string(),
      }),
      "Key of the uploaded file",
    ),
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY.CODE]: jsonContent(
      createErrorSchema(ImageFileSchema),
      HttpStatus.UNPROCESSABLE_ENTITY.MESSAGE,
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
  },
});

export const removeUserAvatar = createRoute({
  summary: "deletes user avatar",
  description: "Delete the user avatar",
  tags,
  method: "delete",
  path: "/avatars",
  middleware: [authMiddleware],
  responses: {
    [HttpStatus.NO_CONTENT.CODE]: {
      description: "Avatar deleted",
    },
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.FORBIDDEN.CODE]: jsonContent(
      forbiddenSchema,
      "Forbidden",
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
  },
});

const ImageIdParamsSchema = z.object({
  slug: z.string().openapi({
    param: { name: "slug", in: "path" },
    description: "Location slug",
    example: "new-york-a5wr1",
  }),
  id: z.string().openapi({
    param: { name: "id", in: "path" },
    description: "Location log id",
    example: "1",
  }),
  imageId: z.string().openapi({
    param: { name: "imageId", in: "path" },
    description: "Image id",
    example: "1",
  }),
});

export const uploadImage = createRoute({
  summary: "uploads an image to a location log",
  description: "Upload an image to a location log",
  tags,
  method: "post",
  path: "/images/{slug}/{id}",
  middleware: [authMiddleware],
  request: {
    params: SlugIdParamsSchema,
    body: multipartContent(
      ImageFileSchema,
      "Image file to upload",
    ),
  },
  responses: {
    [HttpStatus.OK.CODE]: jsonContent(
      z.object({
        fileUrl: z.string(),
      }),
      "URL of the uploaded image",
    ),
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY.CODE]: jsonContent(
      createErrorSchema(ImageFileSchema).or(SlugIdParamsSchema),
      "Validation error(s)",
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
  },
});

export const removeImage = createRoute({
  summary: "deletes an image from a location log",
  description: "Delete an image from a location log",
  tags,
  method: "delete",
  path: "/images/{slug}/{id}/{imageId}",
  middleware: [authMiddleware],
  request: {
    params: ImageIdParamsSchema,
  },
  responses: {
    [HttpStatus.NO_CONTENT.CODE]: {
      description: "Image deleted",
    },
    [HttpStatus.UNAUTHORIZED.CODE]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
    [HttpStatus.FORBIDDEN.CODE]: jsonContent(
      forbiddenSchema,
      "Forbidden",
    ),
    [HttpStatus.NOT_FOUND.CODE]: jsonContent(
      notFoundSchema,
      "Not found",
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY.CODE]: jsonContent(
      createErrorSchema(ImageIdParamsSchema),
      "Validation error(s)",
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR.CODE]: jsonContent(
      serverErrorSchema,
      "Internal server error",
    ),
  },
});

export type UploadUserAvatarRoute = typeof uploadUserAvatar;
export type RemoveUserAvatarRoute = typeof removeUserAvatar;
export type UploadImageRoute = typeof uploadImage;
export type RemoveImageRoute = typeof removeImage;
