import app from "~/api/app.ts";
import type {
  AppRouteHandler,
  HandlerContext,
  HandlerReturn,
} from "~/api/types/hono.ts";
import env from "~/env.ts";
import { auth } from "~/shared/auth.ts";
import { NO_CONTENT, NOT_FOUND, OK } from "~/shared/http-status.ts";
import { HTTPException } from "hono/http-exception";
import type {
  RemoveImageRoute,
  RemoveUserAvatarRoute,
  UploadImageRoute,
  UploadUserAvatarRoute,
} from "./routes.ts";
import * as filesService from "./services.ts";

export const uploadUserAvatar: AppRouteHandler<UploadUserAvatarRoute> = async (
  c: HandlerContext<UploadUserAvatarRoute>,
): HandlerReturn<UploadUserAvatarRoute> => {
  const user = c.get("user");
  const { file } = c.req.valid("form");

  const fileKey = await filesService.uploadUserAvatar(file, user.id);

  await auth.api.updateUser({
    body: {
      image: fileKey,
    },
    headers: c.req.raw.headers,
  });

  return c.json({
    fileKey: fileKey,
  }, OK.CODE);
};

export const removeUserAvatar: AppRouteHandler<RemoveUserAvatarRoute> = async (
  c: HandlerContext<RemoveUserAvatarRoute>,
): Promise<Response> => {
  const user = c.get("user");

  if (!user.image) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  await filesService.removeUserAvatar(user.id);

  await auth.api.updateUser({
    body: {
      image: undefined,
    },
    headers: c.req.raw.headers,
  });

  return c.body(null, NO_CONTENT.CODE);
};

export const uploadImage: AppRouteHandler<UploadImageRoute> = async (
  c: HandlerContext<UploadImageRoute>,
): HandlerReturn<UploadImageRoute> => {
  const user = c.get("user");
  const { slug, id } = c.req.valid("param");
  const { file } = c.req.valid("form");

  await app.request(`/api/locations/${slug}/${id}/`, {
    headers: c.req.raw.headers,
  });

  const key = await filesService.uploadImage(file, user.id, id);

  await filesService.insertLocationLogImage(Number(id), key, Number(user.id));

  const url = `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${key}`;

  return c.json({
    fileUrl: url,
  }, OK.CODE);
};

export const removeImage: AppRouteHandler<RemoveImageRoute> = async (
  c: HandlerContext<RemoveImageRoute>,
): Promise<Response> => {
  const user = c.get("user");
  const { imageId } = c.req.valid("param");

  await filesService.deleteLocationLogImage(Number(imageId), Number(user.id));

  return c.body(null, NO_CONTENT.CODE);
};
