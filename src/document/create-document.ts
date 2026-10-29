import { CONTENT_WIDTH_MAX, CONTENT_WIDTH_MIN } from "../constants/editor";
import { FONT_WEIGHTS, LINK_DECORATIONS, isStyleValue } from "../constants/style-values";
import { cssBorderStyle, cssColor, cssFont, cssLength, cssSpacing } from "../utils/css-values";
import { DEFAULT_EMAIL_BODY, DOCUMENT_VERSION } from "./constants";
import type { EmailBlockNode, EmailDocument, EmailBodySettings } from "../types/document";

export function resolveEmailBody(body?: Partial<EmailBodySettings> | null): EmailBodySettings {
  const source = body ?? {};
  const defaults = DEFAULT_EMAIL_BODY;
  const width = Number(source.contentWidth ?? defaults.contentWidth);
  return {
    textColor: cssColor(source.textColor, defaults.textColor),
    backgroundColor: cssColor(source.backgroundColor, defaults.backgroundColor),
    contentWidth: Number.isFinite(width) ? Math.min(CONTENT_WIDTH_MAX, Math.max(CONTENT_WIDTH_MIN, Math.round(width))) : defaults.contentWidth,
    fontFamily: cssFont(source.fontFamily, defaults.fontFamily),
    fontWeight: isStyleValue(FONT_WEIGHTS, source.fontWeight) ? source.fontWeight : defaults.fontWeight,
    linkColor: cssColor(source.linkColor, defaults.linkColor),
    linkDecoration: isStyleValue(LINK_DECORATIONS, source.linkDecoration) ? source.linkDecoration : defaults.linkDecoration,
    contentPadding: cssSpacing(source.contentPadding, defaults.contentPadding),
    blockGap: cssLength(source.blockGap, defaults.blockGap),
    borderWidth: cssLength(source.borderWidth, defaults.borderWidth),
    borderStyle: cssBorderStyle(source.borderStyle),
    borderColor: cssColor(source.borderColor, defaults.borderColor),
  };
}

export function mergeEmailBody(
  base: Partial<EmailBodySettings> | null | undefined,
  patch?: Partial<EmailBodySettings> | null,
): EmailBodySettings {
  const current = resolveEmailBody(base);
  const defined = Object.fromEntries(Object.entries(patch ?? {}).filter(([, value]) => value !== undefined));
  return resolveEmailBody({ ...current, ...defined });
}

export function sameEmailBody(left: EmailBodySettings, right: EmailBodySettings): boolean {
  return JSON.stringify(resolveEmailBody(left)) === JSON.stringify(resolveEmailBody(right));
}

export function createEmailDocument(blocks: EmailBlockNode[] = []): EmailDocument {
  return { version: DOCUMENT_VERSION, body: resolveEmailBody(), blocks };
}

export function createEmptyDocument(): EmailDocument {
  return { version: DOCUMENT_VERSION, subject: "", body: resolveEmailBody(), blocks: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function ensureEmailDocument(document: EmailDocument): EmailDocument {
  if (!isRecord(document)) {
    throw new TypeError("Invalid email document: expected an object.");
  }
  if (!Array.isArray(document.blocks)) {
    throw new TypeError("Invalid email document: blocks must be an array.");
  }
  if (document.body != null && !isRecord(document.body)) {
    throw new TypeError("Invalid email document: body must be an object when provided.");
  }
  if (document.subject !== undefined && typeof document.subject !== "string") {
    throw new TypeError("Invalid email document: subject must be a string when provided.");
  }
  for (const [index, block] of document.blocks.entries()) {
    const path = `Invalid email document: blocks[${index}]`;
    if (!isRecord(block)) throw new TypeError(`${path} must be an object.`);
    if (typeof block.id !== "string" || !block.id.trim()) {
      throw new TypeError(`${path}.id must be a non-empty string.`);
    }
    if (typeof block.type !== "string" || !block.type.trim()) {
      throw new TypeError(`${path}.type must be a non-empty string.`);
    }
    if (!isRecord(block.controls)) {
      throw new TypeError(`${path}.controls must be an object.`);
    }
  }
  return { ...document, body: resolveEmailBody(document.body) };
}
