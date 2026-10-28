import { safeEmailUrl } from "./email-tools";
import type { ControlKind, ControlOptions } from "./types";

/** 只校验已归一化的值，不能再次调用字段 read。空 URL/选项允许作为可选值。 */
export function controlConstraintError(kind: ControlKind, options: ControlOptions<unknown>, value: unknown): string | undefined {
  if (kind === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) return "Enter a finite number.";
    if (options.min !== undefined && value < options.min) return `Must be at least ${options.min}.`;
    if (options.max !== undefined && value > options.max) return `Must be at most ${options.max}.`;
  }
  if (kind === "select" && value !== "" && !options.options?.some((option) => option.value === value)) return "Choose one of the available options.";
  if ((kind === "url" || kind === "image") && typeof value === "string" && value.trim() && !safeEmailUrl(value, kind === "image")) {
    return kind === "image" ? "Use an http, https, cid or template image URL." : "Use an http, https, mailto, tel or template URL.";
  }
  if (kind === "list" && Array.isArray(value)) {
    if (options.min !== undefined && value.length < options.min) return `Add at least ${options.min} items.`;
    if (options.max !== undefined && value.length > options.max) return `Use at most ${options.max} items.`;
  }
  return undefined;
}
