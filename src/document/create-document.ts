import { CONTENT_WIDTH_MAX, CONTENT_WIDTH_MIN } from "../constants/editor";
import { FONT_WEIGHTS, HORIZONTAL_ALIGNS, LINK_DECORATIONS, TEXT_ALIGNS, isStyleValue } from "../constants/style-values";
import { cssBorderStyle, cssColor, cssFont, cssLength, cssLineHeight, cssSpacing } from "../utils/css-values";
import { DEFAULT_EMAIL_GLOBAL, DOCUMENT_VERSION } from "./constants";
import type { EmailBlockNode, EmailDocument, EmailGlobalSettings } from "../types/document";

export function resolveEmailGlobal(global?: Partial<EmailGlobalSettings> | null): EmailGlobalSettings {
  const source = global ?? {};
  const defaults = DEFAULT_EMAIL_GLOBAL;
  const width = Number(source.contentWidth ?? defaults.contentWidth);
  return {
    textAlign: isStyleValue(TEXT_ALIGNS, source.textAlign) ? source.textAlign : TEXT_ALIGNS.left,
    textColor: cssColor(source.textColor, defaults.textColor),
    backgroundColor: cssColor(source.backgroundColor, defaults.backgroundColor),
    contentBackgroundColor: cssColor(source.contentBackgroundColor, defaults.contentBackgroundColor),
    contentWidth: Number.isFinite(width) ? Math.min(CONTENT_WIDTH_MAX, Math.max(CONTENT_WIDTH_MIN, Math.round(width))) : defaults.contentWidth,
    contentAlign: isStyleValue(HORIZONTAL_ALIGNS, source.contentAlign) ? source.contentAlign : HORIZONTAL_ALIGNS.center,
    contentPadding: cssSpacing(source.contentPadding, defaults.contentPadding),
    outerPadding: cssSpacing(source.outerPadding, defaults.outerPadding),
    blockGap: cssLength(source.blockGap, defaults.blockGap),
    fontFamily: cssFont(source.fontFamily, defaults.fontFamily),
    fontWeight: isStyleValue(FONT_WEIGHTS, source.fontWeight) ? source.fontWeight : FONT_WEIGHTS.normal,
    defaultFontSize: cssLength(source.defaultFontSize, defaults.defaultFontSize),
    defaultLineHeight: cssLineHeight(source.defaultLineHeight, defaults.defaultLineHeight),
    paragraphSpacing: cssLength(source.paragraphSpacing, defaults.paragraphSpacing),
    listSpacing: cssLength(source.listSpacing, defaults.listSpacing),
    listIndent: cssLength(source.listIndent, defaults.listIndent),
    linkColor: cssColor(source.linkColor, defaults.linkColor),
    linkDecoration: isStyleValue(LINK_DECORATIONS, source.linkDecoration) ? source.linkDecoration : LINK_DECORATIONS.underline,
    borderWidth: cssLength(source.borderWidth, defaults.borderWidth),
    borderStyle: cssBorderStyle(source.borderStyle),
    borderColor: cssColor(source.borderColor, defaults.borderColor),
    borderRadius: cssLength(source.borderRadius, defaults.borderRadius),
  };
}

export function mergeEmailGlobal(
  base: Partial<EmailGlobalSettings> | null | undefined,
  patch?: Partial<EmailGlobalSettings> | null,
): EmailGlobalSettings {
  const current = resolveEmailGlobal(base);
  const defined = Object.fromEntries(Object.entries(patch ?? {}).filter(([, value]) => value !== undefined));
  return resolveEmailGlobal({ ...current, ...defined });
}

export function sameEmailGlobal(left: EmailGlobalSettings, right: EmailGlobalSettings): boolean {
  return JSON.stringify(resolveEmailGlobal(left)) === JSON.stringify(resolveEmailGlobal(right));
}

export function createEmailDocument(blocks: EmailBlockNode[] = []): EmailDocument {
  return { version: DOCUMENT_VERSION, global: resolveEmailGlobal(), blocks };
}

export function createEmptyDocument(): EmailDocument {
  return { version: DOCUMENT_VERSION, subject: "", global: resolveEmailGlobal(), blocks: [] };
}

export function ensureEmailDocument(document: EmailDocument): EmailDocument {
  return { ...document, global: resolveEmailGlobal(document.global) };
}
