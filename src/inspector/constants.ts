import { FONT_WEIGHTS, HORIZONTAL_ALIGNS } from "../constants/style-values";

export const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const TEXT_ALIGN_OPTIONS = [
  { value: HORIZONTAL_ALIGNS.left, label: "Left", glyph: "⇤" },
  { value: HORIZONTAL_ALIGNS.center, label: "Center", glyph: "⇔" },
  { value: HORIZONTAL_ALIGNS.right, label: "Right", glyph: "⇥" },
] as const;

export const GLOBAL_FONT_WEIGHTS = [
  { label: "Regular", value: FONT_WEIGHTS.normal },
  { label: "Bold", value: FONT_WEIGHTS.bold },
] as const;

export const SPACING_SIDES = ["Top", "Right", "Bottom", "Left"] as const;

export const CORNER_SIDES = ["Top left", "Top right", "Bottom right", "Bottom left"] as const;

export const SPACING_MAX = 120;
