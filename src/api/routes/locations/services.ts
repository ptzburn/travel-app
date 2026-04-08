import db from "~/api/db/index.ts";
import { locations } from "~/api/db/schema/locations.ts";
import type { SelectLocationLogImage } from "~/api/types/location-log-images.ts";
import type { SelectLocationLog } from "~/api/types/location-logs.ts";
import type {
  InsertLocation,
  SelectLocation,
  UpdateLocation,
} from "~/api/types/locations.ts";
import { NOT_FOUND } from "~/shared/http-status.ts";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 5);

export async function findLocationWithLogs(
  slug: string,
  userId: number,
): Promise<
  SelectLocation & {
    locationLogs: (SelectLocationLog & { images: SelectLocationLogImage[] })[];
  }
> {
  const location = await db.query.locations.findFirst({
    where: {
      slug,
      userId,
    },
    with: {
      locationLogs: {
        orderBy: { startedAt: "desc" },
        with: {
          images: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!location) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  return location;
}

export async function findLocations(userId: number): Promise<SelectLocation[]> {
  return await db.query.locations.findMany({
    where: { userId },
  });
}

export async function findLocationByName(
  existing: InsertLocation,
  userId: number,
): Promise<SelectLocation> {
  const location = await db.query.locations.findFirst({
    where: {
      name: existing.name,
      userId,
    },
  });

  if (!location) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  return location;
}

export async function findLocationBySlug(
  slug: string,
): Promise<SelectLocation | undefined> {
  return await db.query.locations.findFirst({
    where: { slug },
  });
}

export async function findUniqueSlug(slug: string): Promise<string> {
  let existing = !!(await findLocationBySlug(slug));

  while (existing) {
    const id = nanoid();
    const idSlug = `${slug}-${id}`;
    // deno-lint-ignore no-await-in-loop
    existing = !!(await findLocationBySlug(idSlug));
    if (!existing) {
      return idSlug;
    }
  }

  return slug;
}

export async function insertLocation(
  insertable: InsertLocation,
  slug: string,
  userId: number,
): Promise<SelectLocation> {
  const [created] = await db.insert(locations).values({
    ...insertable,
    slug,
    userId,
  }).returning();

  return created;
}

export async function updateLocationBySlug(
  updates: UpdateLocation,
  slug: string,
  userId: number,
): Promise<SelectLocation> {
  const [updated] = await db.update(locations).set(updates).where(and(
    eq(locations.slug, slug),
    eq(locations.userId, userId),
  )).returning();

  if (!updated) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  return updated;
}

export async function removeLocationBySlug(
  slug: string,
  userId: number,
): Promise<SelectLocation> {
  const [removed] = await db.delete(locations).where(and(
    eq(locations.slug, slug),
    eq(locations.userId, userId),
  )).returning();

  if (!removed) {
    throw new HTTPException(NOT_FOUND.CODE, {
      message: NOT_FOUND.MESSAGE,
    });
  }

  return removed;
}
