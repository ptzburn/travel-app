import { createRouter } from "~/api/lib/create-app.ts";

import * as handlers from "./handlers.ts";
import * as routes from "./routes.ts";

const files = createRouter()
  .openapi(routes.uploadUserAvatar, handlers.uploadUserAvatar)
  .openapi(routes.removeUserAvatar, handlers.removeUserAvatar)
  .openapi(routes.uploadImage, handlers.uploadImage);

export default files;
