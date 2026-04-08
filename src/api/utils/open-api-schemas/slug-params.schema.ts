import { z } from "@hono/zod-openapi";

const SlugParamsSchema = (name: string, description: string) => {
  return z.object({
    [name]: z.string().openapi({
      param: {
        name,
        in: "path",
      },
      description,
      example: "new-york-a5wr1",
    }),
  });
};

export default SlugParamsSchema;
