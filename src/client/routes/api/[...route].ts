import type { APIEvent } from "@solidjs/start/server";

import honoApp from "~/api/app.ts";

async function handler(event: APIEvent): Promise<Response> {
  return await honoApp.fetch(event.request);
}

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
export const HEAD = handler;
