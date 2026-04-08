import { z } from "@hono/zod-openapi";

const SlugIdParamsSchema = z.object({
  slug: z.string().openapi({
    param: {
      name: "slug",
      in: "path",
    },
    description: "Location slug",
    example: "new-york-a5wr1",
  }),
  id: z.string().openapi({
    param: {
      name: "id",
      in: "path",
    },
    description: "Location log id",
    example: "507f1f77bcf86cd799439011",
  }),
});

export default SlugIdParamsSchema;
