import type { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import type { AppBindings } from "~/api/types/hono.ts";

export default function configureOpenAPI(app: OpenAPIHono<AppBindings>): void {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Tasks API",
    },
  });

  app.get(
    "/docs",
    Scalar({
      pageTitle: "API Documentation",
      theme: "deepSpace",
      layout: "classic",
      defaultHttpClient: { targetKey: "js", clientKey: "fetch" },
      sources: [
        { url: "/api/doc", title: "API" },
        { url: "/api/auth/open-api/generate-schema", title: "Authentication" },
      ],
    }),
  );
}
