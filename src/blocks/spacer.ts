import { SPACER_SECTIONS } from "./inspector-sections";
import { BLOCK_TYPES } from "../constants/block-types";
import { createBlockPlugin } from "../plugins/create-block-plugin";
import { EmailControls } from "../plugins/controls";
import { spacerHtml } from "../render/spacer";
import { ICON_SPACER } from "./icons";
import { BG_COLOR } from "./style-controls";

export const spacerBlock = createBlockPlugin({
  containerStyles: false,
  inspectorSections: SPACER_SECTIONS,
  type: BLOCK_TYPES.spacer, title: "Spacer", icon: ICON_SPACER, description: "Vertical whitespace",
  controls: { height: EmailControls.number({ label: "Height", defaultValue: 16, min: 0, max: 240, step: 1, unit: "px" }) },
  styleControls: [{ ...BG_COLOR, labelKey: "common.background" }],
  renderEmail: ({ controls }) => spacerHtml(controls.height, "16px"),
});
