import { HORIZONTAL_ALIGNS } from "../constants/style-values";

export const TEXT_ALIGN_OPTIONS = [
  { value: HORIZONTAL_ALIGNS.left, label: "Left", glyph: "⇤" },
  { value: HORIZONTAL_ALIGNS.center, label: "Center", glyph: "⇔" },
  { value: HORIZONTAL_ALIGNS.right, label: "Right", glyph: "⇥" },
] as const;

export const SPACING_SIDES = ["Top", "Right", "Bottom", "Left"] as const;

export const CORNER_SIDES = ["Top left", "Top right", "Bottom right", "Bottom left"] as const;

export const SPACING_MAX = 120;
