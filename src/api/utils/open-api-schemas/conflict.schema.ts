import { z } from "@hono/zod-openapi";

const conflictSchema = z.object({
  success: z.literal(false).openapi({ example: false }),
  message: z.string().openapi({
    example: "Conflict",
  }),
});

export default conflictSchema;
