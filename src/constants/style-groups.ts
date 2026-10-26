import type { StyleGroup } from "../types/block";

interface StyleGroupOption {
  group: StyleGroup;
  label: string;
}

export const STYLE_GROUPS: StyleGroupOption[] = [
  { group: "general", label: "General" },
  { group: "dimension", label: "Spacing" },
  { group: "typography", label: "Typography" },
  { group: "decorations", label: "Decoration" },
];
