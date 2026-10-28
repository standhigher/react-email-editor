import { SPACER_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import { defineBlock } from "../plugins/define-block";
import { EmailControls } from "../plugins/controls";
import { spacerHtml } from "../render/spacer";
import { ICON_SPACER } from "./icons";
import { BG_COLOR } from "./style-controls";

export const spacerBlock = defineBlock({
  containerStyles: false,
  inspectorSections: SPACER_SECTIONS,
  type: BLOCK_TYPES.spacer, title: "Spacer", icon: ICON_SPACER, description: "Vertical whitespace",
  controls: { height: EmailControls.number({ label: "Height", defaultValue: 16, min: 0, max: 240, step: 1, unit: "px" }) },
  styleControls: [BG_COLOR],
  renderEmail: ({ controls }) => spacerHtml(controls.height, "16px"),
});
