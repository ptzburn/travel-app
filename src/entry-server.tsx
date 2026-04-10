// @refresh reload
// deno-lint-ignore-file
import { createHandler, StartServer } from "@solidjs/start/server";
import { getLocale } from "./paraglide/runtime.js";
import { paraglideMiddleware } from "./paraglide/server.js";

const app = createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang={getLocale()}>
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, interactive-widget=resizes-content"
          />
          <link rel="icon" type="image/png" href="/icon.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossorigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Antic&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
          {assets}
        </head>
        <body class="antialiased">
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));

export default {
  fetch(request: Request) {
    return paraglideMiddleware(request, () => app.fetch(request));
  },
};
