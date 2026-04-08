import createMessageObjectSchema from "~/api/utils/create-message-object.ts";
import { NOT_FOUND } from "~/shared/http-status.ts";

export const ZOD_ERROR_MESSAGES = {
  REQUIRED: "Required",
  EXPECTED_NUMBER: "Expected number, received nan",
  NO_UPDATES: "No updates provided",
};

export const ZOD_ERROR_CODES = {
  INVALID_UPDATES: "invalid_updates",
};

export const notFoundSchema = createMessageObjectSchema(
  NOT_FOUND.MESSAGE,
);
