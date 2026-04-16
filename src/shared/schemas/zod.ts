import * as m from "~/paraglide/messages.js";
import { z } from "zod";

export const RetrieveParamsSchema = z.object({
  id: z.string().min(1),
});

export const NameSchema = z.string().min(1).max(100);
export const DescriptionSchema = z.string().max(1000).or(z.null());
export const LatSchema = z.number().min(-90).max(90);
export const LongSchema = z.number().min(-180).max(180);
export const DateSchema = z.iso.datetime({
  message: m.validation_date_required(),
});
