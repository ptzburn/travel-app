import db from "~/api/db/index.ts";
import { locationLogs } from "~/api/db/schema/location-logs.ts";
import type { SelectLocationLogImage } from "~/api/types/location-log-images.ts";
import type { SelectLocationLog } from "~/api/types/location-logs.ts";
import type { InsertLocationLog } from "~/api/types/location-logs.ts";
import { NOT_FOUND, UNPROCESSABLE_ENTITY } from "~/shared/http-status.ts";
import { haversineDistance, MAX_LOG_RADIUS_KM } from "~/shared/utils/geo.ts";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function assertWithinRadius(
  logLat: number,
  logLong: number,
  parentLat: number,
  parentLong: number,
): void {
  const distance = haversineDistance(logLat, logLong, parentLat, parentLong);
  if (distance > MAX_LOG_RADIUS_KM) {
    throw new HTTPException(UNPROCESSABLE_ENTITY.CODE, {
      message:
        `Location log must be within ${MAX_LOG_RADIUS_KM} km of the parent location (current distance: ${
          Math.round(distance)
        } km)`,
    });
  }
}

export async function findLocationLog(
  id: number,
  userId: number,
): Promise<SelectLocationLog & { images: SelectLocationLogImage[] }> {
  const foundLog = await db.query.locationLogs.findFirst({
    where: {
      id,
      userId,
    },
    with: {
      images: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!foundLog) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  return foundLog;
}

export async function insertLocationLog(
  locationId: number,
  insertable: InsertLocationLog,
  userId: number,
): Promise<SelectLocationLog> {
  const [inserted] = await db.insert(locationLogs).values({
    ...insertable,
    locationId,
    userId,
  }).returning();

  if (!inserted) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  return inserted;
}

export async function updateLocationLog(
  locationLogId: number,
  updatable: InsertLocationLog,
  userId: number,
): Promise<SelectLocationLog> {
  const [updated] = await db.update(locationLogs).set({
    ...updatable,
  }).where(
    and(
      eq(locationLogs.id, locationLogId),
      eq(locationLogs.userId, userId),
    ),
  ).returning();

  if (!updated) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  return updated;
}

export async function deleteLocationLog(
  locationLogId: number,
  userId: number,
): Promise<SelectLocationLog> {
  const [deleted] = await db.delete(locationLogs).where(
    and(
      eq(locationLogs.id, locationLogId),
      eq(locationLogs.userId, userId),
    ),
  ).returning();

  if (!deleted) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  return deleted;
}
