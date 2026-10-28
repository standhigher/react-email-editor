export const TEXT_ALIGNS = {
  left: "left",
  center: "center",
  right: "right",
  justify: "justify",
} as const;

/** Text alignment: left, center, right, justify. */
export type TextAlign = (typeof TEXT_ALIGNS)[keyof typeof TEXT_ALIGNS];

export const HORIZONTAL_ALIGNS = {
  left: "left",
  center: "center",
  right: "right",
} as const;

/** Element alignment: left, center, right. */
export type HorizontalAlign = (typeof HORIZONTAL_ALIGNS)[keyof typeof HORIZONTAL_ALIGNS];

export const FONT_WEIGHTS = {
  normal: "normal",
  bold: "bold",
} as const;

/** Font weight: normal or bold. */
export type FontWeight = (typeof FONT_WEIGHTS)[keyof typeof FONT_WEIGHTS];

export const BORDER_STYLES = {
  none: "none",
  solid: "solid",
  dashed: "dashed",
  dotted: "dotted",
} as const;

/** Border style: none, solid, dashed, dotted. */
export type BorderStyle = (typeof BORDER_STYLES)[keyof typeof BORDER_STYLES];

export const LINK_DECORATIONS = {
  underline: "underline",
  none: "none",
} as const;

/** Link decoration: underline or none. */
export type LinkDecoration = (typeof LINK_DECORATIONS)[keyof typeof LINK_DECORATIONS];

export function isStyleValue<const T extends Record<string, string>>(
  values: T,
  value: unknown,
): value is T[keyof T] {
  return typeof value === "string" && (Object.values(values) as string[]).includes(value);
}

export const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
