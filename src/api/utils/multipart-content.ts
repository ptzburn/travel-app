import type { ZodSchema } from "~/api/types/hono.ts";

function multipartContent<
  T extends ZodSchema,
>(schema: T, description: string): {
  content: {
    "multipart/form-data": {
      schema: T;
    };
  };
  description: string;
} {
  return {
    content: {
      "multipart/form-data": {
        schema,
      },
    },
    description,
  };
}

export default multipartContent;
