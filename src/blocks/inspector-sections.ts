import type { BlockInspectorSection } from "../types/block";

const SPACING: BlockInspectorSection = {
  id: "spacing", title: "Spacing", styleIds: ["dimension.padding", "dimension.margin"],
};
const BLOCK_BORDERS = ["decorations.borderWidth", "decorations.borderStyle", "decorations.borderColor", "decorations.borderRadius"];
const BLOCK_APPEARANCE: BlockInspectorSection = {
  id: "blockAppearance", title: "Block appearance", styleIds: ["decorations.backgroundColor", ...BLOCK_BORDERS],
};
const ADVANCED_BLOCK_APPEARANCE: BlockInspectorSection = {
  id: "blockAppearance", title: "Block appearance", styleIds: ["decorations.backgroundColor"], advancedStyleIds: BLOCK_BORDERS,
};
const ELEMENT_BORDERS = ["element.borderWidth", "element.borderStyle", "element.borderColor", "element.borderRadius"];

export const HEADING_SECTIONS: BlockInspectorSection[] = [SPACING, BLOCK_APPEARANCE];
export const TEXT_SECTIONS: BlockInspectorSection[] = [SPACING, BLOCK_APPEARANCE];
export const HTML_SECTIONS: BlockInspectorSection[] = [
  { id: "html", title: "HTML", controlNames: ["html"] }, SPACING, BLOCK_APPEARANCE,
];
export const BUTTON_SECTIONS: BlockInspectorSection[] = [
  { id: "link", title: "Link", controlNames: ["href"] },
  { id: "button", title: "Button", styleIds: ["element.align", "element.width", "element.padding", "element.backgroundColor", ...ELEMENT_BORDERS] },
  SPACING, ADVANCED_BLOCK_APPEARANCE,
];
export const IMAGE_SECTIONS: BlockInspectorSection[] = [
  { id: "image", title: "Image", controlNames: ["src", "alt", "link"] },
  { id: "sizePosition", title: "Size & position", styleIds: ["element.width", "element.height", "element.align"] },
  { id: "imageAppearance", title: "Image appearance", styleIds: ELEMENT_BORDERS }, SPACING, ADVANCED_BLOCK_APPEARANCE,
];
export const DIVIDER_SECTIONS: BlockInspectorSection[] = [
  { id: "line", title: "Line", styleIds: ["element.borderColor", "element.borderWidth", "element.borderStyle", "element.width", "element.align"] },
  SPACING, { id: "blockAppearance", title: "Block appearance", styleIds: ["decorations.backgroundColor"] },
];
export const SPACER_SECTIONS: BlockInspectorSection[] = [
  { id: "spacer", title: "Spacer", controlNames: ["height"], styleIds: ["decorations.backgroundColor"] },
];
