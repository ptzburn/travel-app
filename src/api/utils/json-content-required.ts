import type { ZodSchema } from "~/api/types/hono.ts";

import jsonContent from "~/api/utils/json-content.ts";

const jsonContentRequired = <
  T extends ZodSchema,
>(schema: T, description: string) => {
  return {
    ...jsonContent(schema, description),
    required: true,
  };
};

export default jsonContentRequired;
