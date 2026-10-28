import type { BlockInspectorSection } from "../types/block";

const SPACING: BlockInspectorSection = {
  title: "Spacing", styleIds: ["dimension.padding", "dimension.margin"],
};
const BLOCK_BORDERS = ["decorations.borderWidth", "decorations.borderStyle", "decorations.borderColor", "decorations.borderRadius"];
const BLOCK_APPEARANCE: BlockInspectorSection = {
  title: "Block appearance", styleIds: ["decorations.backgroundColor", ...BLOCK_BORDERS],
};
const ADVANCED_BLOCK_APPEARANCE: BlockInspectorSection = {
  title: "Block appearance", styleIds: ["decorations.backgroundColor"], advancedStyleIds: BLOCK_BORDERS,
};
const ELEMENT_BORDERS = ["element.borderWidth", "element.borderStyle", "element.borderColor", "element.borderRadius"];

export const HEADING_SECTIONS: BlockInspectorSection[] = [SPACING, BLOCK_APPEARANCE];
export const TEXT_SECTIONS: BlockInspectorSection[] = [SPACING, BLOCK_APPEARANCE];
export const HTML_SECTIONS: BlockInspectorSection[] = [
  { title: "HTML", controlNames: ["html"] }, SPACING, BLOCK_APPEARANCE,
];
export const BUTTON_SECTIONS: BlockInspectorSection[] = [
  { title: "Link", controlNames: ["href"] },
  { title: "Button", styleIds: ["element.align", "element.width", "element.padding", "element.backgroundColor", ...ELEMENT_BORDERS] },
  SPACING, ADVANCED_BLOCK_APPEARANCE,
];
export const IMAGE_SECTIONS: BlockInspectorSection[] = [
  { title: "Image", controlNames: ["src", "alt", "link"] },
  { title: "Size & position", styleIds: ["element.width", "element.height", "element.align"] },
  { title: "Image appearance", styleIds: ELEMENT_BORDERS }, SPACING, ADVANCED_BLOCK_APPEARANCE,
];
export const DIVIDER_SECTIONS: BlockInspectorSection[] = [
  { title: "Line", styleIds: ["element.borderColor", "element.borderWidth", "element.borderStyle", "element.width", "element.align"] },
  SPACING, { title: "Block appearance", styleIds: ["decorations.backgroundColor"] },
];
export const SPACER_SECTIONS: BlockInspectorSection[] = [
  { title: "Spacer", controlNames: ["height"], styleIds: ["decorations.backgroundColor"] },
];
