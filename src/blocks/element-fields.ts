import type { StyleFieldConfig } from "../types/block";
import type { EmailElementStyle } from "../types/document";
import { BORDER_COLOR, BORDER_RADIUS, BORDER_STYLE, BORDER_WIDTH, FONT_FAMILY, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from "./style-fields";

/** 按钮盒子的初始外观。重置和缺省渲染都回到这组值，而不是透明底。 */
export const BUTTON_BOX_DEFAULTS = {
  align: "center",
  backgroundColor: "#005bd3",
  borderRadius: "8px",
  borderWidth: "1px",
  borderColor: "#005bd3",
  padding: "12px 32px",
} as const satisfies EmailElementStyle;

function elementBorderLabel(field: StyleFieldConfig): string {
  if (field.id === "decorations.borderColor") return "Outline";
  const stripped = field.label.replace(/^Block /, "");
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

export const ELEMENT_BORDER_FIELDS: StyleFieldConfig[] = [BORDER_WIDTH, BORDER_STYLE, BORDER_COLOR, BORDER_RADIUS].map((field) => ({
  ...field,
  id: field.id.replace("decorations.", "element."),
  group: "decorations",
  label: elementBorderLabel(field),
}));
export const ELEMENT_ALIGN: StyleFieldConfig = { id: "element.align", group: "general", label: "Alignment", control: "alignment", defaultValue: "center" };
export const ELEMENT_WIDTH: StyleFieldConfig = { id: "element.width", group: "general", label: "Width", control: "range", units: ["px", "%", "auto"], min: 0, max: 600, defaultValue: "auto" };
export const BUTTON_STYLE_FIELDS: StyleFieldConfig[] = [
  ELEMENT_ALIGN, ELEMENT_WIDTH,
  { id: "element.padding", group: "dimension", label: "Button padding", control: "spacing", defaultValue: BUTTON_BOX_DEFAULTS.padding },
  ...[FONT_FAMILY, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT].map((field): StyleFieldConfig => ({ ...field, id: field.id.replace("typography.", "element.") })),
  { id: "element.color", group: "typography", label: "Text", control: "color" },
  { id: "element.backgroundColor", group: "decorations", label: "Button", control: "color", defaultValue: BUTTON_BOX_DEFAULTS.backgroundColor },
  ...ELEMENT_BORDER_FIELDS.map((field) => ({
    ...field,
    defaultValue: field.id === "element.borderWidth" ? BUTTON_BOX_DEFAULTS.borderWidth
      : field.id === "element.borderColor" ? BUTTON_BOX_DEFAULTS.borderColor
        : field.id === "element.borderRadius" ? BUTTON_BOX_DEFAULTS.borderRadius
          : field.defaultValue,
  })),
];
export const IMAGE_STYLE_FIELDS: StyleFieldConfig[] = [
  ELEMENT_WIDTH,
  { id: "element.height", group: "general", label: "Height", control: "range", units: ["px", "auto"], min: 0, max: 480, defaultValue: "auto" },
  ...ELEMENT_BORDER_FIELDS,
];
export const DIVIDER_STYLE_FIELDS: StyleFieldConfig[] = [
  ELEMENT_ALIGN, { ...ELEMENT_WIDTH, units: ["px", "%"], defaultValue: "100%" },
  { ...ELEMENT_BORDER_FIELDS[0], label: "Line thickness", defaultValue: "1px" },
  { ...ELEMENT_BORDER_FIELDS[1], label: "Line style" },
];
