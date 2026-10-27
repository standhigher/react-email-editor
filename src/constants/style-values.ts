export const TEXT_ALIGNS = {
  left: "left",
  center: "center",
  right: "right",
  justify: "justify",
} as const;

export type TextAlign = (typeof TEXT_ALIGNS)[keyof typeof TEXT_ALIGNS];

export const HORIZONTAL_ALIGNS = {
  left: "left",
  center: "center",
  right: "right",
} as const;

export type HorizontalAlign = (typeof HORIZONTAL_ALIGNS)[keyof typeof HORIZONTAL_ALIGNS];

export const FONT_WEIGHTS = {
  normal: "normal",
  bold: "bold",
} as const;

export type FontWeight = (typeof FONT_WEIGHTS)[keyof typeof FONT_WEIGHTS];

export const BORDER_STYLES = {
  none: "none",
  solid: "solid",
  dashed: "dashed",
  dotted: "dotted",
} as const;

export type BorderStyle = (typeof BORDER_STYLES)[keyof typeof BORDER_STYLES];

export const LINK_DECORATIONS = {
  underline: "underline",
  none: "none",
} as const;

export type LinkDecoration = (typeof LINK_DECORATIONS)[keyof typeof LINK_DECORATIONS];

export function isStyleValue<const T extends Record<string, string>>(
  values: T,
  value: unknown,
): value is T[keyof T] {
  return typeof value === "string" && (Object.values(values) as string[]).includes(value);
}

export const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
