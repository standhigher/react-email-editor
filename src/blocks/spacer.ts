import { SPACER_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import type { BlockDefinition } from "../types/block";
import { spacerHtml } from "../render/spacer";
import { ICON_SPACER } from "./icons";
import { BG_COLOR } from "./style-fields";

export const spacerBlock: BlockDefinition = {
  exactStyleFields: true,
  inspectorSections: SPACER_SECTIONS,
  type: BLOCK_TYPES.spacer, title: "Spacer", icon: ICON_SPACER, description: "Vertical whitespace",
  fields: [{ type: "number", name: "height", label: "Height", defaultValue: 16, min: 0, max: 240, step: 1 }],
  styleFields: [BG_COLOR],
  render: ({ fields }) => spacerHtml(fields.height, "16px"),
};
