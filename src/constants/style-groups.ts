import type { StyleGroup } from "../types/block";

/** Inspector group option. */
interface StyleGroupOption {
  /** Group identifier. */
  group: StyleGroup;
  /** Display label. */
  label: string;
}

export const STYLE_GROUPS: StyleGroupOption[] = [
  { group: "general", label: "General" },
  { group: "dimension", label: "Spacing" },
  { group: "typography", label: "Typography" },
  { group: "decorations", label: "Decoration" },
];
