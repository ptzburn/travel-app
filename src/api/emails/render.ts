import type { TemplateName, TemplateVariables } from "./generated-types.ts";

export type { TemplateName } from "./generated-types.ts";

const templates = import.meta.glob<string>("./templates/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

function loadTemplate(filename: string): string {
  const key = `./templates/${filename}`;
  const html = templates[key];
  if (!html) throw new Error(`Email template not found: ${filename}`);
  return html;
}

export function renderTemplate<T extends TemplateName>(
  name: T,
  variables: TemplateVariables[T],
): string {
  const html = loadTemplate(`${name}.html`);
  return html.replace(
    /\{\{\{(\w+)\}\}\}/g,
    (_, key) => (variables as Record<string, string>)[key] ?? "",
  );
}
