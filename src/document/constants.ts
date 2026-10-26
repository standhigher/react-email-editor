import { CANVAS_DEVICE_WIDTH } from "../constants/editor";
import type { FieldOption } from "../types/block";
import type { EmailGlobalSettings } from "../types/document";

export const FONT_FAMILIES: FieldOption[] = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
];

export function fontFamilyLabel(value: string): string {
  const match = FONT_FAMILIES.find((font) => font.value === value);
  if (match) return match.label;
  const name = value.split(",")[0]?.replace(/['"]/g, "").trim();
  return name || "Arial";
}

export function fontFamilyOptions(value: string): FieldOption[] {
  if (FONT_FAMILIES.some((font) => font.value === value)) return FONT_FAMILIES;
  return [{ label: fontFamilyLabel(value), value }, ...FONT_FAMILIES];
}

export const DEFAULT_EMAIL_GLOBAL: EmailGlobalSettings = {
  textColor: "#000000",
  textAlign: "left",
  backgroundColor: "#ffffff",
  contentBackgroundColor: "#ffffff",
  contentWidth: CANVAS_DEVICE_WIDTH.desktop,
  contentAlign: "center",
  contentPadding: "24px",
  outerPadding: "0px",
  blockGap: "16px",
  paragraphSpacing: "6px",
  listSpacing: "4px",
  listIndent: "22px",
  borderWidth: "0px",
  borderStyle: "solid",
  borderColor: "#000000",
  borderRadius: "0px",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontWeight: "normal",
  defaultFontSize: "16px",
  defaultLineHeight: "1.5",
  linkColor: "#005bd3",
  linkDecoration: "underline",
};
