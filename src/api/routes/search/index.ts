import { createRouter } from "~/api/lib/create-app.ts";

import * as handlers from "./handlers.ts";
import * as routes from "./routes.ts";

const search = createRouter()
  .openapi(
    routes.suggest,
    handlers.suggest,
  )
  .openapi(
    routes.retrieve,
    handlers.retrieve,
  );

export default search;
