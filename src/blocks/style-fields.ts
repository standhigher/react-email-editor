import type { StyleFieldConfig } from "../types/block";

export const PADDING: StyleFieldConfig = {
  id: "dimension.padding",
  group: "dimension",
  label: "Padding",
  control: "range",
  unit: "px",
  min: 0,
  max: 64,
  step: 4,
};

export const FONT_SIZE: StyleFieldConfig = {
  id: "typography.fontSize",
  group: "typography",
  label: "Font size",
  control: "number",
  unit: "px",
  min: 8,
  max: 72,
};

export const FONT_WEIGHT: StyleFieldConfig = {
  id: "typography.fontWeight",
  group: "typography",
  label: "Weight",
  control: "select",
  options: [
    { label: "Regular", value: "normal" },
    { label: "Bold", value: "bold" },
  ],
};

export const LINE_HEIGHT: StyleFieldConfig = {
  id: "typography.lineHeight",
  group: "typography",
  label: "Line height",
  control: "range",
  min: 1,
  max: 2,
  step: 0.05,
};

export const TEXT_COLOR: StyleFieldConfig = {
  id: "typography.color",
  group: "typography",
  label: "Text color",
  control: "color",
};

export const TEXT_ALIGN: StyleFieldConfig = {
  id: "typography.textAlign",
  group: "typography",
  label: "Align",
  control: "alignment",
};

export const BG_COLOR: StyleFieldConfig = {
  id: "decorations.backgroundColor",
  group: "decorations",
  label: "Background",
  control: "color",
};

export const BORDER_RADIUS: StyleFieldConfig = {
  id: "decorations.borderRadius",
  group: "decorations",
  label: "Corner radius",
  control: "range",
  unit: "px",
  min: 0,
  max: 32,
  step: 2,
};
