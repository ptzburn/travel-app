import type { _Object } from "@aws-sdk/client-s3";

import {
  DeleteObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import db from "~/api/db/index.ts";
import { locationLogImages } from "~/api/db/schema/index.ts";
import type { SelectLocationLogImage } from "~/api/types/location-log-images.ts";
import env from "~/env.ts";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "~/shared/http-status.ts";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

const client = new S3Client({
  region: env.S3_REGION,
  forcePathStyle: true,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_ACCESS_SECRET,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export async function uploadUserAvatar(
  file: Blob,
  userId: string,
): Promise<string> {
  await removeUserAvatar(userId);

  const uniqueId = crypto.randomUUID();
  const fileKey = `users/${userId}/avatar/${uniqueId}.webp`;

  const buffer = await file.arrayBuffer();

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: fileKey,
    Body: new Uint8Array(buffer),
    ContentType: file.type,
  });

  const result = await client.send(command);

  if (result.$metadata.httpStatusCode !== 200) {
    throw new HTTPException(INTERNAL_SERVER_ERROR.CODE, {
      message: INTERNAL_SERVER_ERROR.MESSAGE,
    });
  }

  return fileKey;
}

export async function removeUserAvatar(
  userId: string,
): Promise<void> {
  const prefix = `users/${userId}/avatar/`;

  const listCommand = new ListObjectsCommand({
    Bucket: env.S3_BUCKET,
    Prefix: prefix,
  });

  const { Contents } = await client.send(listCommand);

  if (!Contents || Contents.length === 0) {
    return;
  }

  await Promise.all(
    Contents.map((object) => {
      if (!object.Key) return Promise.resolve();

      const deleteCommand = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: object.Key,
      });

      return client.send(deleteCommand);
    }),
  );
}

export async function uploadImage(
  file: Blob,
  userId: string,
  locationLogId: string,
): Promise<string> {
  await removeUserAvatar(userId);

  const fileName = crypto.randomUUID();
  const fileKey = `${userId}/${locationLogId}/${fileName}.webp`;

  const buffer = await file.arrayBuffer();

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: fileKey,
    Body: new Uint8Array(buffer),
    ContentType: file.type,
  });

  const result = await client.send(command);

  if (result.$metadata.httpStatusCode !== 200) {
    throw new HTTPException(INTERNAL_SERVER_ERROR.CODE, {
      message: INTERNAL_SERVER_ERROR.MESSAGE,
    });
  }

  return fileKey;
}

export async function insertLocationLogImage(
  locationLogId: number,
  key: string,
  userId: number,
): Promise<SelectLocationLogImage> {
  const [inserted] = await db.insert(locationLogImages).values({
    locationLogId,
    key,
    userId,
  }).returning();

  if (!inserted) {
    throw new HTTPException(INTERNAL_SERVER_ERROR.CODE, {
      message: INTERNAL_SERVER_ERROR.MESSAGE,
    });
  }

  return inserted;
}

export async function deleteLocationLogImage(
  imageId: number,
  userId: number,
): Promise<void> {
  const image = await db.query.locationLogImages.findFirst({
    where: {
      id: imageId,
      userId,
    },
  });

  if (!image) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  const deleteCommand = new DeleteObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: image.key,
  });
  await client.send(deleteCommand);

  await db.delete(locationLogImages).where(
    eq(locationLogImages.id, imageId),
  );
}
