import { BORDER_STYLES, FONT_WEIGHTS, LINK_DECORATIONS, TEXT_ALIGNS, type BorderStyle } from "../constants/style-values";
import { copyFontFamilies } from "../document/constants";
import type { StyleFieldConfig } from "../types/block";

const BORDER_STYLE_LABELS = {
  none: "None",
  solid: "Solid",
  dashed: "Dashed",
  dotted: "Dotted",
} as const satisfies Record<BorderStyle, string>;

export const PADDING: StyleFieldConfig = { id: "dimension.padding", group: "dimension", label: "Padding", control: "spacing", defaultValue: "0px" };
export const MARGIN: StyleFieldConfig = { id: "dimension.margin", group: "dimension", label: "Outer spacing", control: "spacing", defaultValue: "0px" };
export const BLOCK_HEIGHT: StyleFieldConfig = { id: "dimension.height", group: "dimension", label: "Block height", control: "range", unit: "px", min: 0, max: 480 };
export const FONT_FAMILY: StyleFieldConfig = { id: "typography.fontFamily", group: "typography", label: "Font family", control: "select", options: copyFontFamilies() };
export const FONT_SIZE: StyleFieldConfig = { id: "typography.fontSize", group: "typography", label: "Font size", control: "range", unit: "px", min: 8, max: 72 };
export const FONT_WEIGHT: StyleFieldConfig = { id: "typography.fontWeight", group: "typography", label: "Weight", control: "select", options: [{ label: "Regular", value: FONT_WEIGHTS.normal }, { label: "Bold", value: FONT_WEIGHTS.bold }] };
export const LINE_HEIGHT: StyleFieldConfig = { id: "typography.lineHeight", group: "typography", label: "Line height", control: "range", min: 1, max: 2.5, step: 0.05 };
export const TEXT_COLOR: StyleFieldConfig = { id: "typography.color", group: "typography", label: "Text", control: "color" };
export const TEXT_ALIGN: StyleFieldConfig = { id: "typography.textAlign", group: "typography", label: "Text alignment", control: "select", options: [{ label: "Left", value: TEXT_ALIGNS.left }, { label: "Center", value: TEXT_ALIGNS.center }, { label: "Right", value: TEXT_ALIGNS.right }, { label: "Justify", value: TEXT_ALIGNS.justify }] };
export const BG_COLOR: StyleFieldConfig = { id: "decorations.backgroundColor", group: "decorations", label: "Background", control: "color", defaultValue: "transparent" };
export const BORDER_RADIUS: StyleFieldConfig = { id: "decorations.borderRadius", group: "decorations", label: "Block corner radius", control: "corners", max: 48, defaultValue: "0px" };
export const BORDER_WIDTH: StyleFieldConfig = { id: "decorations.borderWidth", group: "decorations", label: "Block border width", control: "range", unit: "px", min: 0, max: 12, defaultValue: "0px" };
export const BORDER_COLOR: StyleFieldConfig = { id: "decorations.borderColor", group: "decorations", label: "Border", control: "color", defaultValue: "transparent" };
export const BORDER_STYLE: StyleFieldConfig = {
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
const PARAGRAPH_SPACING: StyleFieldConfig = { id: "typography.paragraphSpacing", group: "typography", label: "Paragraph spacing", control: "range", unit: "px", min: 0, max: 48 };
const LIST_SPACING: StyleFieldConfig = { id: "typography.listSpacing", group: "typography", label: "List spacing", control: "range", unit: "px", min: 0, max: 48 };
const LIST_INDENT: StyleFieldConfig = { id: "typography.listIndent", group: "typography", label: "List indent", control: "range", unit: "px", min: 0, max: 64 };
const LINK_COLOR: StyleFieldConfig = { id: "typography.linkColor", group: "typography", label: "Link", control: "color" };
const LINK_DECORATION: StyleFieldConfig = { id: "typography.linkDecoration", group: "typography", label: "Link decoration", control: "select", options: [{ label: "Underline", value: LINK_DECORATIONS.underline }, { label: "None", value: LINK_DECORATIONS.none }] };

const DIMENSION_FIELDS = { padding: PADDING, margin: MARGIN, height: BLOCK_HEIGHT } satisfies Record<string, StyleFieldConfig>;
const DECORATION_FIELDS = {
  backgroundColor: BG_COLOR,
  borderWidth: BORDER_WIDTH,
  borderStyle: BORDER_STYLE,
  borderColor: BORDER_COLOR,
  borderRadius: BORDER_RADIUS,
} satisfies Record<string, StyleFieldConfig>;
const TYPOGRAPHY_FIELD_MAP = {
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
} satisfies Record<string, StyleFieldConfig>;

export type DimensionFieldName = keyof typeof DIMENSION_FIELDS;
export type DecorationFieldName = keyof typeof DECORATION_FIELDS;
export type TypographyFieldName = keyof typeof TYPOGRAPHY_FIELD_MAP;

export const COMMON_STYLE_FIELDS = [PADDING, MARGIN, BLOCK_HEIGHT, BG_COLOR, BORDER_WIDTH, BORDER_STYLE, BORDER_COLOR, BORDER_RADIUS];
export const TYPOGRAPHY_FIELDS: StyleFieldConfig[] = [
  FONT_FAMILY, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, TEXT_COLOR, TEXT_ALIGN,
  PARAGRAPH_SPACING, LIST_SPACING, LIST_INDENT, LINK_COLOR, LINK_DECORATION,
];

/** 内置区块按需声明，不包含固定高度或文字排版。 */
export const WRAPPER_STYLE_FIELDS: StyleFieldConfig[] = [
  { ...PADDING, label: "Block padding" }, MARGIN,
  { ...BG_COLOR, label: "Block background" }, BORDER_WIDTH, BORDER_STYLE, { ...BORDER_COLOR, label: "Block border" }, BORDER_RADIUS,
];

function copyStyleField(field: StyleFieldConfig, overrides?: Partial<StyleFieldConfig>): StyleFieldConfig {
  const next: StyleFieldConfig = { ...field, ...overrides };
  if (next.options) next.options = next.options.map((option) => ({ ...option }));
  if (next.units) next.units = [...next.units];
  return next;
}

type StyleFieldOverrideMap<Name extends string> = Partial<Record<Name, Partial<StyleFieldConfig>>>;

function createFieldSet<Name extends string>(
  fields: Record<Name, StyleFieldConfig>,
  overrides?: StyleFieldOverrideMap<Name>,
): Record<Name, StyleFieldConfig> {
  const result = {} as Record<Name, StyleFieldConfig>;
  for (const name of Object.keys(fields) as Name[]) {
    result[name] = copyStyleField(fields[name], overrides?.[name]);
  }
  return result;
}

export function createDimensionFields(overrides?: StyleFieldOverrideMap<DimensionFieldName>): Record<DimensionFieldName, StyleFieldConfig> {
  return createFieldSet(DIMENSION_FIELDS, overrides);
}

export function createDecorationFields(overrides?: StyleFieldOverrideMap<DecorationFieldName>): Record<DecorationFieldName, StyleFieldConfig> {
  return createFieldSet(DECORATION_FIELDS, overrides);
}

export function createTypographyFields(overrides?: StyleFieldOverrideMap<TypographyFieldName>): Record<TypographyFieldName, StyleFieldConfig> {
  return createFieldSet(TYPOGRAPHY_FIELD_MAP, overrides);
}

/** 容器字段按固定槽位合并。相同 id 使用调用方字段，其余字段按原顺序接在后面。返回值都是副本。 */
export function resolveBlockStyleFields(fields?: StyleFieldConfig[], exactStyleFields = false): StyleFieldConfig[] {
  const custom = (fields ?? []).map((field) => copyStyleField(field));
  if (exactStyleFields) return custom;
  const customById = new Map<string, StyleFieldConfig>();
  for (const field of custom) {
    if (!customById.has(field.id)) customById.set(field.id, field);
  }
  const commonIds = new Set(COMMON_STYLE_FIELDS.map((field) => field.id));
  const merged = COMMON_STYLE_FIELDS.map((field) => customById.get(field.id) ?? copyStyleField(field));
  return [...merged, ...custom.filter((field) => !commonIds.has(field.id))];
}
