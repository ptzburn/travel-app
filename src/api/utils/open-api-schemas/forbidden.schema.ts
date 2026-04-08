import { z } from "@hono/zod-openapi";

const forbiddenSchema = z.object({
  success: z.boolean().openapi({
    example: false,
  }),
  message: z.string().openapi({
    example: "Forbidden",
  }),
});

export default forbiddenSchema;
