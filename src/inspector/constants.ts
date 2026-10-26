export const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const TEXT_ALIGN_OPTIONS = [
  { value: "left", label: "Left", glyph: "⇤" },
  { value: "center", label: "Center", glyph: "⇔" },
  { value: "right", label: "Right", glyph: "⇥" },
] as const;

export const GLOBAL_FONT_WEIGHTS = [
  { label: "Regular", value: "normal" },
  { label: "Bold", value: "bold" },
] as const;

export const SPACING_SIDES = ["Top", "Right", "Bottom", "Left"] as const;

export const SPACING_MAX = 120;
