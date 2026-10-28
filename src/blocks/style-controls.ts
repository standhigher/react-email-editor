import { BORDER_STYLES, FONT_WEIGHTS, LINK_DECORATIONS, TEXT_ALIGNS, type BorderStyle } from "../constants/style-values";
import { copyFontFamilies } from "../document/constants";
import type { StyleControlConfig } from "../types/block";

const BORDER_STYLE_LABELS = {
  none: "None",
  solid: "Solid",
  dashed: "Dashed",
  dotted: "Dotted",
} as const satisfies Record<BorderStyle, string>;

export const PADDING: StyleControlConfig = { id: "dimension.padding", group: "dimension", label: "Padding", control: "spacing", defaultValue: "0px" };
export const MARGIN: StyleControlConfig = { id: "dimension.margin", group: "dimension", label: "Outer spacing", control: "spacing", defaultValue: "0px" };
export const BLOCK_HEIGHT: StyleControlConfig = { id: "dimension.height", group: "dimension", label: "Block height", control: "range", unit: "px", min: 0, max: 480 };
export const FONT_FAMILY: StyleControlConfig = { id: "typography.fontFamily", group: "typography", label: "Font family", control: "select", options: copyFontFamilies() };
export const FONT_SIZE: StyleControlConfig = { id: "typography.fontSize", group: "typography", label: "Font size", control: "range", unit: "px", min: 8, max: 72 };
export const FONT_WEIGHT: StyleControlConfig = { id: "typography.fontWeight", group: "typography", label: "Weight", control: "select", options: [{ label: "Regular", value: FONT_WEIGHTS.normal }, { label: "Bold", value: FONT_WEIGHTS.bold }] };
export const LINE_HEIGHT: StyleControlConfig = { id: "typography.lineHeight", group: "typography", label: "Line height", control: "range", min: 1, max: 2.5, step: 0.05 };
export const TEXT_COLOR: StyleControlConfig = { id: "typography.color", group: "typography", label: "Text", control: "color" };
export const TEXT_ALIGN: StyleControlConfig = { id: "typography.textAlign", group: "typography", label: "Text alignment", control: "select", options: [{ label: "Left", value: TEXT_ALIGNS.left }, { label: "Center", value: TEXT_ALIGNS.center }, { label: "Right", value: TEXT_ALIGNS.right }, { label: "Justify", value: TEXT_ALIGNS.justify }] };
export const BG_COLOR: StyleControlConfig = { id: "decorations.backgroundColor", group: "decorations", label: "Background", control: "color", defaultValue: "transparent" };
export const BORDER_RADIUS: StyleControlConfig = { id: "decorations.borderRadius", group: "decorations", label: "Block corner radius", control: "corners", max: 48, defaultValue: "0px" };
export const BORDER_WIDTH: StyleControlConfig = { id: "decorations.borderWidth", group: "decorations", label: "Block border width", control: "range", unit: "px", min: 0, max: 12, defaultValue: "0px" };
export const BORDER_COLOR: StyleControlConfig = { id: "decorations.borderColor", group: "decorations", label: "Border", control: "color", defaultValue: "transparent" };
export const BORDER_STYLE: StyleControlConfig = {
  id: "decorations.borderStyle",
  group: "decorations",
  label: "Block border style",
  control: "select",
  defaultValue: BORDER_STYLES.solid,
  options: (Object.keys(BORDER_STYLES) as BorderStyle[]).map((key) => ({
    label: BORDER_STYLE_LABELS[key],
    value: BORDER_STYLES[key],
  })),
};
const PARAGRAPH_SPACING: StyleControlConfig = { id: "typography.paragraphSpacing", group: "typography", label: "Paragraph spacing", control: "range", unit: "px", min: 0, max: 48 };
const LIST_SPACING: StyleControlConfig = { id: "typography.listSpacing", group: "typography", label: "List spacing", control: "range", unit: "px", min: 0, max: 48 };
const LIST_INDENT: StyleControlConfig = { id: "typography.listIndent", group: "typography", label: "List indent", control: "range", unit: "px", min: 0, max: 64 };
const LINK_COLOR: StyleControlConfig = { id: "typography.linkColor", group: "typography", label: "Link", control: "color" };
const LINK_DECORATION: StyleControlConfig = { id: "typography.linkDecoration", group: "typography", label: "Link decoration", control: "select", options: [{ label: "Underline", value: LINK_DECORATIONS.underline }, { label: "None", value: LINK_DECORATIONS.none }] };

const DIMENSION_CONTROLS = { padding: PADDING, margin: MARGIN, height: BLOCK_HEIGHT } satisfies Record<string, StyleControlConfig>;
const DECORATION_CONTROLS = {
  backgroundColor: BG_COLOR,
  borderWidth: BORDER_WIDTH,
  borderStyle: BORDER_STYLE,
  borderColor: BORDER_COLOR,
  borderRadius: BORDER_RADIUS,
} satisfies Record<string, StyleControlConfig>;
const TYPOGRAPHY_CONTROL_MAP = {
  fontFamily: FONT_FAMILY,
  fontSize: FONT_SIZE,
  fontWeight: FONT_WEIGHT,
  lineHeight: LINE_HEIGHT,
  color: TEXT_COLOR,
  textAlign: TEXT_ALIGN,
  paragraphSpacing: PARAGRAPH_SPACING,
  listSpacing: LIST_SPACING,
  listIndent: LIST_INDENT,
  linkColor: LINK_COLOR,
  linkDecoration: LINK_DECORATION,
} satisfies Record<string, StyleControlConfig>;

/** Dimension names: padding, margin, height. */
export type DimensionControlName = keyof typeof DIMENSION_CONTROLS;
/** Appearance control names. */
export type DecorationControlName = keyof typeof DECORATION_CONTROLS;
/** Typography control names. */
export type TypographyControlName = keyof typeof TYPOGRAPHY_CONTROL_MAP;

export const TYPOGRAPHY_CONTROLS: StyleControlConfig[] = [
  FONT_FAMILY, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, TEXT_COLOR, TEXT_ALIGN,
  PARAGRAPH_SPACING, LIST_SPACING, LIST_INDENT, LINK_COLOR, LINK_DECORATION,
];

/** 内置区块按需声明，不包含固定高度或文字排版。 */
export const WRAPPER_STYLE_CONTROLS: StyleControlConfig[] = [
  { ...PADDING, label: "Block padding" }, MARGIN,
  { ...BG_COLOR, label: "Block background" }, BORDER_WIDTH, BORDER_STYLE, { ...BORDER_COLOR, label: "Block border" }, BORDER_RADIUS,
];

function copyStyleControl(control: StyleControlConfig, overrides?: Partial<StyleControlConfig>): StyleControlConfig {
  const next: StyleControlConfig = { ...control, ...overrides };
  if (next.options) next.options = next.options.map((option) => ({ ...option }));
  if (next.units) next.units = [...next.units];
  return next;
}

type StyleControlOverrideMap<Name extends string> = Partial<Record<Name, Partial<StyleControlConfig>>>;

function createControlSet<Name extends string>(
  controls: Record<Name, StyleControlConfig>,
  overrides?: StyleControlOverrideMap<Name>,
): Record<Name, StyleControlConfig> {
  const result = {} as Record<Name, StyleControlConfig>;
  for (const name of Object.keys(controls) as Name[]) {
    result[name] = copyStyleControl(controls[name], overrides?.[name]);
  }
  return result;
}

export function createDimensionControls(overrides?: StyleControlOverrideMap<DimensionControlName>): Record<DimensionControlName, StyleControlConfig> {
  return createControlSet(DIMENSION_CONTROLS, overrides);
}

export function createDecorationControls(overrides?: StyleControlOverrideMap<DecorationControlName>): Record<DecorationControlName, StyleControlConfig> {
  return createControlSet(DECORATION_CONTROLS, overrides);
}

export function createTypographyControls(overrides?: StyleControlOverrideMap<TypographyControlName>): Record<TypographyControlName, StyleControlConfig> {
  return createControlSet(TYPOGRAPHY_CONTROL_MAP, overrides);
}
