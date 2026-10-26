import type { StyleFieldConfig } from "../types/block";
import { FONT_FAMILIES } from "../document/constants";

export const PADDING: StyleFieldConfig = { id: "dimension.padding", group: "dimension", label: "Padding", control: "spacing", defaultValue: "0px" };
export const MARGIN: StyleFieldConfig = { id: "dimension.margin", group: "dimension", label: "Outer spacing", control: "spacing", defaultValue: "0px" };
export const FONT_FAMILY: StyleFieldConfig = { id: "typography.fontFamily", group: "typography", label: "Font family", control: "select", options: FONT_FAMILIES };
export const FONT_SIZE: StyleFieldConfig = { id: "typography.fontSize", group: "typography", label: "Font size", control: "range", unit: "px", min: 8, max: 72 };
export const FONT_WEIGHT: StyleFieldConfig = { id: "typography.fontWeight", group: "typography", label: "Weight", control: "select", options: [{ label: "Regular", value: "normal" }, { label: "Bold", value: "bold" }] };
export const LINE_HEIGHT: StyleFieldConfig = { id: "typography.lineHeight", group: "typography", label: "Line height", control: "range", min: 1, max: 2.5, step: 0.05 };
export const TEXT_COLOR: StyleFieldConfig = { id: "typography.color", group: "typography", label: "Text", control: "color" };
export const TEXT_ALIGN: StyleFieldConfig = { id: "typography.textAlign", group: "typography", label: "Text alignment", control: "select", options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }, { label: "Justify", value: "justify" }] };
export const BG_COLOR: StyleFieldConfig = { id: "decorations.backgroundColor", group: "decorations", label: "Background", control: "color", defaultValue: "transparent" };
export const BORDER_RADIUS: StyleFieldConfig = { id: "decorations.borderRadius", group: "decorations", label: "Block corner radius", control: "range", unit: "px", min: 0, max: 48, defaultValue: "0px" };
export const BORDER_WIDTH: StyleFieldConfig = { id: "decorations.borderWidth", group: "decorations", label: "Block border width", control: "range", unit: "px", min: 0, max: 12, defaultValue: "0px" };
export const BORDER_COLOR: StyleFieldConfig = { id: "decorations.borderColor", group: "decorations", label: "Border", control: "color", defaultValue: "#000000" };
export const BORDER_STYLE: StyleFieldConfig = { id: "decorations.borderStyle", group: "decorations", label: "Block border style", control: "select", defaultValue: "solid", options: [{ label: "None", value: "none" }, { label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }] };
export const COMMON_STYLE_FIELDS = [PADDING, MARGIN, BG_COLOR, BORDER_WIDTH, BORDER_STYLE, BORDER_COLOR, BORDER_RADIUS];
export const TYPOGRAPHY_FIELDS: StyleFieldConfig[] = [
  FONT_FAMILY, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, TEXT_COLOR, TEXT_ALIGN,
  { id: "typography.paragraphSpacing", group: "typography", label: "Paragraph spacing", control: "range", unit: "px", min: 0, max: 48 },
  { id: "typography.listSpacing", group: "typography", label: "List spacing", control: "range", unit: "px", min: 0, max: 48 },
  { id: "typography.listIndent", group: "typography", label: "List indent", control: "range", unit: "px", min: 0, max: 64 },
  { id: "typography.linkColor", group: "typography", label: "Link", control: "color" },
  { id: "typography.linkDecoration", group: "typography", label: "Link decoration", control: "select", options: [{ label: "Underline", value: "underline" }, { label: "None", value: "none" }] },
];
