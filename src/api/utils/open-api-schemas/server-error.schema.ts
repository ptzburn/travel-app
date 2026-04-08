import { z } from "@hono/zod-openapi";

const serverErrorSchema = z.object({
  success: z.boolean().openapi({
    example: false,
  }),
  message: z.string().openapi({
    example: "Internal Server Error",
  }),
});

export default serverErrorSchema;
