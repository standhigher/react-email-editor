import { CONTENT_WIDTH_MAX, CONTENT_WIDTH_MIN } from "../constants/editor";
import { DEFAULT_EMAIL_GLOBAL } from "./constants";
import type { EmailBlockNode, EmailDocument, EmailGlobalSettings } from "../types/document";

const CONTENT_ALIGNS = new Set<EmailGlobalSettings["contentAlign"]>([
  "left",
  "center",
  "right",
]);

function safeColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed || /[;"'<>{}\\]/.test(trimmed)) return fallback;
  return trimmed;
}

function safeFontFamily(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed || /[;<>{}\\]/.test(trimmed)) return fallback;
  return trimmed;
}

function safeAlign(
  value: unknown,
  fallback: EmailGlobalSettings["contentAlign"],
): EmailGlobalSettings["contentAlign"] {
  return typeof value === "string" && CONTENT_ALIGNS.has(value as EmailGlobalSettings["contentAlign"])
    ? (value as EmailGlobalSettings["contentAlign"])
    : fallback;
}

function safeWeight(
  value: unknown,
  fallback: EmailGlobalSettings["fontWeight"],
): EmailGlobalSettings["fontWeight"] {
  return value === "normal" || value === "bold" ? value : fallback;
}

function safeWidth(value: unknown, fallback: number): number {
  const width = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(width)) return fallback;
  return Math.min(CONTENT_WIDTH_MAX, Math.max(CONTENT_WIDTH_MIN, Math.round(width)));
}

export function resolveEmailGlobal(
  global?: Partial<EmailGlobalSettings> | null,
): EmailGlobalSettings {
  const source = global ?? {};
  return {
    textColor: safeColor(source.textColor, DEFAULT_EMAIL_GLOBAL.textColor),
    backgroundColor: safeColor(source.backgroundColor, DEFAULT_EMAIL_GLOBAL.backgroundColor),
    contentWidth: safeWidth(source.contentWidth, DEFAULT_EMAIL_GLOBAL.contentWidth),
    contentAlign: safeAlign(source.contentAlign, DEFAULT_EMAIL_GLOBAL.contentAlign),
    fontFamily: safeFontFamily(source.fontFamily, DEFAULT_EMAIL_GLOBAL.fontFamily),
    fontWeight: safeWeight(source.fontWeight, DEFAULT_EMAIL_GLOBAL.fontWeight),
  };
}

export function mergeEmailGlobal(
  base: Partial<EmailGlobalSettings> | null | undefined,
  patch?: Partial<EmailGlobalSettings> | null,
): EmailGlobalSettings {
  const current = resolveEmailGlobal(base);
  if (!patch) return current;
  const next: Partial<EmailGlobalSettings> = { ...current };
  if (patch.textColor !== undefined) next.textColor = safeColor(patch.textColor, current.textColor);
  if (patch.backgroundColor !== undefined) {
    next.backgroundColor = safeColor(patch.backgroundColor, current.backgroundColor);
  }
  if (patch.contentWidth !== undefined) {
    next.contentWidth = safeWidth(patch.contentWidth, current.contentWidth);
  }
  if (patch.contentAlign !== undefined) {
    next.contentAlign = safeAlign(patch.contentAlign, current.contentAlign);
  }
  if (patch.fontFamily !== undefined) {
    next.fontFamily = safeFontFamily(patch.fontFamily, current.fontFamily);
  }
  if (patch.fontWeight !== undefined) {
    next.fontWeight = safeWeight(patch.fontWeight, current.fontWeight);
  }
  return resolveEmailGlobal(next);
}

export function sameEmailGlobal(
  left: EmailGlobalSettings,
  right: EmailGlobalSettings,
): boolean {
  return (
    left.textColor === right.textColor &&
    left.backgroundColor === right.backgroundColor &&
    left.contentWidth === right.contentWidth &&
    left.contentAlign === right.contentAlign &&
    left.fontFamily === right.fontFamily &&
    left.fontWeight === right.fontWeight
  );
}

export function createEmailDocument(
  blocks: EmailBlockNode[] = [],
): EmailDocument {
  return { version: 1, global: resolveEmailGlobal(), blocks };
}

export function createEmptyDocument(): EmailDocument {
  return {
    version: 1,
    subject: "",
    global: resolveEmailGlobal(),
    blocks: [],
  };
}

export function ensureEmailDocument(document: EmailDocument): EmailDocument {
  return {
    ...document,
    global: resolveEmailGlobal(document.global),
  };
}
