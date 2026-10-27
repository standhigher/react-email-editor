import { CANVAS_DEVICE_WIDTH } from "../constants/editor";
import { BORDER_STYLES, FONT_WEIGHTS, HORIZONTAL_ALIGNS, LINK_DECORATIONS, TEXT_ALIGNS } from "../constants/style-values";
import type { FieldOption } from "../types/block";
import type { EmailGlobalSettings } from "../types/document";

export const DOCUMENT_VERSION = 1 as const;

function fontOption(label: string, value: string): FieldOption {
  return Object.freeze({ label, value });
}

export const FONT_FAMILIES: readonly FieldOption[] = Object.freeze([
  fontOption("Arial", "Arial, Helvetica, sans-serif"),
  fontOption("Helvetica", "Helvetica, Arial, sans-serif"),
  fontOption("Verdana", "Verdana, Geneva, sans-serif"),
  fontOption("Tahoma", "Tahoma, Geneva, sans-serif"),
  fontOption("Trebuchet MS", "'Trebuchet MS', Helvetica, sans-serif"),
  fontOption("Georgia", "Georgia, serif"),
  fontOption("Times New Roman", "'Times New Roman', Times, serif"),
  fontOption("Courier New", "'Courier New', Courier, monospace"),
]);

export function copyFontFamilies(): FieldOption[] {
  return FONT_FAMILIES.map((font) => ({ label: font.label, value: font.value }));
}

export function fontFamilyLabel(value: string): string {
  const match = FONT_FAMILIES.find((font) => font.value === value);
  if (match) return match.label;
  const name = value.split(",")[0]?.replace(/['"]/g, "").trim();
  return name || "Arial";
}

export function fontFamilyOptions(value: string): FieldOption[] {
  const fonts = copyFontFamilies();
  if (fonts.some((font) => font.value === value)) return fonts;
  return [{ label: fontFamilyLabel(value), value }, ...fonts];
}

export const DEFAULT_EMAIL_GLOBAL: EmailGlobalSettings = {
  textColor: "#000000",
  textAlign: TEXT_ALIGNS.left,
  backgroundColor: "#ffffff",
  contentBackgroundColor: "#ffffff",
  contentWidth: CANVAS_DEVICE_WIDTH.desktop,
  contentAlign: HORIZONTAL_ALIGNS.center,
  contentPadding: "0px",
  outerPadding: "0px",
  blockGap: "4px",
  paragraphSpacing: "6px",
  listSpacing: "4px",
  listIndent: "22px",
  borderWidth: "0px",
  borderStyle: BORDER_STYLES.solid,
  borderColor: "#000000",
  borderRadius: "0px",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontWeight: FONT_WEIGHTS.normal,
  defaultFontSize: "16px",
  defaultLineHeight: "1.5",
  linkColor: "#005bd3",
  linkDecoration: LINK_DECORATIONS.underline,
};
