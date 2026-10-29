import { defaultTemplateEngine } from "./default-template-engine";
import type { TemplateData, TemplateEngineOptions, TemplateValidationIssue } from "../types/template";

function normalizeEngineError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error) || "Template engine failed.", { cause: error });
}

/** Resolve a preview with one engine; stored source is never modified. */
export function renderTemplatePreview(
  template: string,
  data?: TemplateData,
  options: TemplateEngineOptions = {},
): string {
  const engine = options.templateEngine ?? defaultTemplateEngine;
  if (data === undefined && engine === defaultTemplateEngine) return template;
  try {
    const html = engine.render(template, structuredClone(data ?? {}));
    if (typeof html !== "string") throw new TypeError("TemplateEngine.render must return a string synchronously.");
    return html;
  } catch (error) {
    throw normalizeEngineError(error);
  }
}

/** Undefined means the selected engine does not provide validation; [] means valid. */
export function validateTemplate(
  template: string,
  options: TemplateEngineOptions = {},
): TemplateValidationIssue[] | undefined {
  const engine = options.templateEngine ?? defaultTemplateEngine;
  try {
    const issues = engine.validate?.(template);
    if (issues !== undefined && !Array.isArray(issues)) throw new TypeError("TemplateEngine.validate must return an array synchronously.");
    return issues;
  } catch (error) {
    throw normalizeEngineError(error);
  }
}
