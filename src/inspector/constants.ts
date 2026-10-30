import { HORIZONTAL_ALIGNS } from "../constants/style-values";

export const TEXT_ALIGN_OPTIONS = [
  { value: HORIZONTAL_ALIGNS.left, labelKey: "common.left", glyph: "⇤" },
  { value: HORIZONTAL_ALIGNS.center, labelKey: "common.center", glyph: "⇔" },
  { value: HORIZONTAL_ALIGNS.right, labelKey: "common.right", glyph: "⇥" },
] as const;

export const SPACING_SIDES = ["common.top", "common.right", "common.bottom", "common.left"] as const;

export const CORNER_SIDES = ["common.topLeft", "common.topRight", "common.bottomRight", "common.bottomLeft"] as const;

export const SPACING_MAX = 120;

export const HTML_SAVE_TOAST_DURATION = 2400;
