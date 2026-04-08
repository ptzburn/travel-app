import { locationLogImages } from "~/api/db/schema/index.ts";
import { createSelectSchema } from "drizzle-zod";

export const SelectLocationLogImage = createSelectSchema(locationLogImages);
