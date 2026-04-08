import { z } from "@hono/zod-openapi";

const unauthorizedSchema = z.object({
  success: z.boolean().openapi({
    example: false,
  }),
  message: z.string().openapi({
    example: "Unauthorized",
  }),
});

export default unauthorizedSchema;
