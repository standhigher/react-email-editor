import { CANVAS_DEVICE_WIDTH } from "../constants/editor";
import { BORDER_STYLES, FONT_WEIGHTS, LINK_DECORATIONS } from "../constants/style-values";
import type { ControlOption } from "../types/block";
import type { EmailBodySettings } from "../types/document";

export const DOCUMENT_VERSION = 4 as const;

function fontOption(label: string, value: string): ControlOption {
  return Object.freeze({ label, value });
}

export const FONT_FAMILIES: readonly ControlOption[] = Object.freeze([
  fontOption("Arial", "Arial, Helvetica, sans-serif"),
  fontOption("Helvetica", "Helvetica, Arial, sans-serif"),
  fontOption("Verdana", "Verdana, Geneva, sans-serif"),
  fontOption("Tahoma", "Tahoma, Geneva, sans-serif"),
  fontOption("Trebuchet MS", "'Trebuchet MS', Helvetica, sans-serif"),
  fontOption("Georgia", "Georgia, serif"),
  fontOption("Times New Roman", "'Times New Roman', Times, serif"),
  fontOption("Courier New", "'Courier New', Courier, monospace"),
]);

export function copyFontFamilies(): ControlOption[] {
  return FONT_FAMILIES.map((font) => ({ label: font.label, value: font.value }));
}

export function fontFamilyLabel(value: string): string {
  const match = FONT_FAMILIES.find((font) => font.value === value);
  if (match) return match.label;
  const name = value.split(",")[0]?.replace(/['"]/g, "").trim();
  return name || "Arial";
}

export function fontFamilyOptions(value: string): ControlOption[] {
  const fonts = copyFontFamilies();
  if (fonts.some((font) => font.value === value)) return fonts;
  return [{ label: fontFamilyLabel(value), value }, ...fonts];
}

export const DEFAULT_EMAIL_BODY: EmailBodySettings = {
  textColor: "#000000",
  backgroundColor: "#ffffff",
  contentWidth: CANVAS_DEVICE_WIDTH.desktop,
  fontFamily: "",
  fontWeight: FONT_WEIGHTS.normal,
  linkColor: "#005bd3",
  linkDecoration: LINK_DECORATIONS.underline,
  contentPadding: "0px",
  blockGap: "4px",
  borderWidth: "0px",
  borderStyle: BORDER_STYLES.solid,
  borderColor: "transparent",
};
