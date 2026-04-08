import { createRouter } from "~/api/lib/create-app.ts";

import * as handlers from "./handlers.ts";
import * as routes from "./routes.ts";

const locations = createRouter()
  .openapi(
    routes.get,
    handlers.get,
  )
  .openapi(
    routes.post,
    handlers.post,
  )
  .openapi(
    routes.put,
    handlers.put,
  )
  .openapi(
    routes.getOne,
    handlers.getOne,
  )
  .openapi(
    routes.remove,
    handlers.remove,
  );

export default locations;
