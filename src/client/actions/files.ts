import { action } from "@solidjs/router";
import { UNPROCESSABLE_ENTITY } from "~/shared/http-status.ts";
import { rpcClient } from "~/shared/rpc-client.ts";

export const uploadImageAction = action(
  async (formData: FormData) => {
    const response = await rpcClient.avatars.$post({
      form: {
        file: formData.get("file") as File,
      },
    });

    if (!response.ok) {
      if (response.status === UNPROCESSABLE_ENTITY.CODE) {
        const json = await response.json();
        const issues = json.error.issues;
        const errorMessages = issues
          .map((issue) => {
            const path = issue.path.length > 0
              ? `${issue.path.join(".")}: `
              : "";
            return `${path}${issue.message ?? issue.code}`;
          })
          .join("; ");
        throw new Error(errorMessages || json.error.name);
      } else {
        const json = await response.json();
        throw new Error(json.message);
      }
    }

    return await response.json();
  },
  "uploadImage",
);
