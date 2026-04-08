import configureOpenAPI from "~/api/lib/configure-open-api.ts";
import createApp from "~/api/lib/create-app.ts";
import files from "~/api/routes/files/index.ts";
import locationLogs from "~/api/routes/location-logs/index.ts";
import locations from "~/api/routes/locations/index.ts";
import search from "~/api/routes/search/index.ts";

const app = createApp().basePath("/api");

configureOpenAPI(app);

const routes = [
  search,
  files,
  locationLogs,
  locations,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
