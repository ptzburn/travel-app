import { locationLogImages } from "~/api/db/schema/location-log-images.ts";
import { locationLogs } from "~/api/db/schema/location-logs.ts";
import { locations } from "~/api/db/schema/locations.ts";
import { defineRelations } from "drizzle-orm";
import {
  accounts,
  passkeys,
  sessions,
  twoFactors,
  users,
} from "../db/schema/auth.ts";

export const relations = defineRelations(
  {
    users,
    sessions,
    accounts,
    twoFactors,
    passkeys,
    locations,
    locationLogs,
    locationLogImages,
  },
  (r) => ({
    users: {
      sessions: r.many.sessions({
        from: r.users.id,
        to: r.sessions.userId,
      }),
      accounts: r.many.accounts({
        from: r.users.id,
        to: r.accounts.userId,
      }),
      twoFactors: r.many.twoFactors({
        from: r.users.id,
        to: r.twoFactors.userId,
      }),
      passkeys: r.many.passkeys({
        from: r.users.id,
        to: r.passkeys.userId,
      }),
      locations: r.many.locations({
        from: r.users.id,
        to: r.locations.userId,
      }),
      locationLogs: r.many.locationLogs({
        from: r.users.id,
        to: r.locationLogs.userId,
      }),
      locationLogImages: r.many.locationLogImages({
        from: r.users.id,
        to: r.locationLogImages.userId,
      }),
    },
    sessions: {
      user: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
      }),
    },
    accounts: {
      user: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
      }),
    },
    twoFactors: {
      user: r.one.users({
        from: r.twoFactors.userId,
        to: r.users.id,
      }),
    },
    passkeys: {
      user: r.one.users({
        from: r.passkeys.userId,
        to: r.users.id,
      }),
    },
    locations: {
      user: r.one.users({
        from: r.locations.userId,
        to: r.users.id,
      }),
      locationLogs: r.many.locationLogs({
        from: r.locations.id,
        to: r.locationLogs.locationId,
      }),
    },
    locationLogs: {
      user: r.one.users({
        from: r.locationLogs.userId,
        to: r.users.id,
      }),
      location: r.one.locations({
        from: r.locationLogs.locationId,
        to: r.locations.id,
      }),
      images: r.many.locationLogImages({
        from: r.locationLogs.id,
        to: r.locationLogImages.locationLogId,
      }),
    },
    locationLogImages: {
      user: r.one.users({
        from: r.locationLogImages.userId,
        to: r.users.id,
      }),
      locationLog: r.one.locationLogs({
        from: r.locationLogImages.locationLogId,
        to: r.locationLogs.id,
      }),
    },
  }),
);
